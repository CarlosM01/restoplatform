@startuml
hide circle
skinparam linetype ortho

entity "Category" {
  * id : uuid <<PK>>
  --
  parent_id : uuid <<FK>>
  name : string
  subtitle : string
  description : text
  image_url : string
  sort_order : int
  is_active : bool
}

entity "MenuItem" {
  * id : uuid <<PK>>
  --
  category_id : uuid <<FK>>
  name : string
  description : text
  base_price : decimal
  image_url : string
  is_available : bool
  is_featured : bool
  sort_order : int
  prep_time_minutes : int
  badge : string
}

entity "MenuItemVariant" {
  * id : uuid <<PK>>
  --
  menu_item_id : uuid <<FK>>
  name : string
  sku : string
  price_override : decimal
  is_available : bool
  sort_order : int
}

entity "MenuItem_ModifierGroup" {
  * menu_item_id : uuid <<PK>>
  * modifier_group_id : uuid <<PK>>
  --
  min_selection : int
  max_selection : int
  sort_order : int
}

entity "ModifierGroup" {
  * id : uuid <<PK>>
  --
  name : string
  description : text
  sort_order : int
}

entity "Supplier" {
  * id : uuid <<PK>>
  --
  name : string
  contact_email : string
  country : string
  is_active : bool
}

entity "Ingredient" {
  * id : uuid <<PK>>
  --
  supplier_id : uuid <<FK>>
  name : string
  description : text
  image_url : string
  origin_country : string
  unit : string
  storage_instructions : text
  is_active : bool
}

entity "MenuItem_DietaryTag" {
  * menu_item_id : uuid <<PK>>
  * dietary_tag_id : uuid <<PK>>
  --
  is_auto_applied : bool
  calculated_from_ingredient_ids : json
}

entity "DietaryTag" {
  * id : uuid <<PK>>
  --
  name : string
  description : text
  icon_url : string
  badge_color : string
  internal_ref_url : string
}

entity "Modifier" {
  * id : uuid <<PK>>
  --
  modifier_group_id : uuid <<FK>>
  name : string
  price_delta : decimal
  max_quantity : int
  is_available : bool
  sort_order : int
}

entity "Allergen" {
  * id : uuid <<PK>>
  --
  name : string
  description : text
  icon_url : string
  severity : string
  internal_ref_url : string
}

entity "Variant_ModifierGroup" {
  * variant_id : uuid <<PK>>
  * modifier_group_id : uuid <<PK>>
  --
  min_selection : int
  max_selection : int
}

entity "Variant_Ingredient" {
  * variant_id : uuid <<PK>>
  * ingredient_id : uuid <<PK>>
  --
  quantity : string
  is_main : bool
}

entity "MenuItem_Ingredient" {
  * menu_item_id : uuid <<PK>>
  * ingredient_id : uuid <<PK>>
  --
  quantity : string
  is_main : bool
}

entity "Modifier_Ingredient" {
  * modifier_id : uuid <<PK>>
  * ingredient_id : uuid <<PK>>
  --
  quantity : string
}

entity "Ingredient_Allergen" {
  * ingredient_id : uuid <<PK>>
  * allergen_id : uuid <<PK>>
}

Category ||--o{ MenuItem
MenuItem ||--o{ MenuItemVariant
MenuItem ||--o{ MenuItem_ModifierGroup
ModifierGroup ||--o{ MenuItem_ModifierGroup
ModifierGroup ||--o{ Modifier
Supplier ||--o{ Ingredient
MenuItem ||--o{ MenuItem_Ingredient
Ingredient ||--o{ MenuItem_Ingredient
MenuItem ||--o{ MenuItem_DietaryTag
DietaryTag ||--o{ MenuItem_DietaryTag
MenuItemVariant ||--o{ Variant_ModifierGroup
ModifierGroup ||--o{ Variant_ModifierGroup
MenuItemVariant ||--o{ Variant_Ingredient
Ingredient ||--o{ Variant_Ingredient
Modifier ||--o{ Modifier_Ingredient
Ingredient ||--o{ Modifier_Ingredient
Ingredient ||--o{ Ingredient_Allergen
Allergen ||--o{ Ingredient_Allergen

@enduml