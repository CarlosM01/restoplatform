from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType
from app.core.database import get_db
from app.core.config import settings
from app.deps import require_cliente
from app.models import Order, Payment, PaymentStatus, OrderStatus, User
from app.schemas import PaymentInit

router = APIRouter(prefix="/payments", tags=["payments"])


def get_tx():
    return Transaction(WebpayOptions(
        commerce_code=settings.transbank_commerce_code,
        api_key=settings.transbank_api_key,
        integration_type=IntegrationType.TEST,
    ))


@router.post("/init/{order_id}", response_model=PaymentInit)
def iniciar_pago(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    order = db.get(Order, order_id)
    if not order or order.customer_id != user.id:
        raise HTTPException(404, "Order no encontrado")
    if order.payment and order.payment.status == PaymentStatus.PAID:
        raise HTTPException(400, "Order ya pagado")

    buy_order = f"OC-{order.id}-{int(order.created_at.timestamp())}"
    session_id = f"S-{user.id}"
    return_url = f"{settings.frontend_url}/payment/retorno"

    response = get_tx().create(buy_order, session_id, int(order.total), return_url)

    # Crear o actualizar payment
    if order.payment:
        order.payment.transbank_token = response["token"]
        order.payment.transbank_buy_order = buy_order
        order.payment.status = PaymentStatus.PENDING
    else:
        payment = Payment(
            order_id=order.id,
            amount=order.total,
            transbank_token=response["token"],
            transbank_buy_order=buy_order,
        )
        db.add(payment)

    db.commit()
    return PaymentInit(url=response["url"], token=response["token"])


@router.post("/confirmar")
def confirmar_pago(token_ws: str = Form(...), db: Session = Depends(get_db)):
    """Webpay redirige acá con token_ws como POST"""
    response = get_tx().commit(token_ws)
    payment = db.scalar(select(Payment).where(Payment.transbank_token == token_ws))
    if not payment:
        raise HTTPException(404, "Payment no encontrado")

    if response.get("status") == "AUTHORIZED" and response.get("response_code") == 0:
        payment.status = PaymentStatus.PAID
        if payment.order:
            payment.order.status = OrderStatus.CONFIRMED
    else:
        payment.status = PaymentStatus.REJECTED

    db.commit()

    # Redirigir al frontend con resultado
    status = "exitoso" if payment.status == PaymentStatus.PAID else "rechazado"
    return RedirectResponse(
        url=f"{settings.frontend_url}/payment/resultado?status={status}&order={payment.order_id}",
        status_code=303,
    )


@router.get("/status/{order_id}")
def estado_pago(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_cliente),
):
    order = db.get(Order, order_id)
    if not order or order.customer_id != user.id:
        raise HTTPException(404)
    if not order.payment:
        return {"status": "sin_pago"}
    return {
        "status": order.payment.status.value,
        "amount": order.payment.amount,
        "pedido_estado": order.status.value,
    }
