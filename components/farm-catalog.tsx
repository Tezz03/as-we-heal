"use client"

import { useState } from "react"

const categories = [
  { label: "Fruit", items: [{ name: "Orchard apples", detail: "Crisp, sweet, and picked this week.", price: "$6 / basket", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80" }, { name: "Strawberries", detail: "Bright berries for breakfast and baking.", price: "$5 / pint", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80" }, { name: "Peaches", detail: "Sun-ripened, fragrant, and tender.", price: "$7 / basket", image: "https://images.unsplash.com/photo-1629828874514-1f0a1ec3b4a6?auto=format&fit=crop&w=900&q=80" }] },
  { label: "Vegetables", items: [{ name: "Heirloom tomatoes", detail: "Juicy varieties for salads and sauces.", price: "$5 / basket", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80" }, { name: "Leafy greens", detail: "Tender kale, chard, and salad mix.", price: "$4 / bunch", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80" }, { name: "Rainbow carrots", detail: "Colorful roots with a sweet crunch.", price: "$4 / bunch", image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=80" }] },
  { label: "Poultry", items: [{ name: "Pasture-raised eggs", detail: "Rich golden yolks from happy hens.", price: "$7 / dozen", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80" }, { name: "Whole chicken", detail: "Tender, air-chilled, and ready to roast.", price: "$18 / bird", image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=900&q=80" }, { name: "Chicken thighs", detail: "Flavorful cuts for weeknight meals.", price: "$12 / pack", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80" }] },
]

export function FarmCatalog() {
  const [active, setActive] = useState("Fruit")
  const category = categories.find((item) => item.label === active) ?? categories[0]
  return <section className="farm-catalog" aria-label="Farm products for sale">
    <div className="catalog-tabs" role="tablist">{categories.map((item) => <button key={item.label} type="button" role="tab" aria-selected={item.label === active} className={`catalog-tab ${item.label === active ? "is-active" : ""}`} onClick={() => setActive(item.label)}>{item.label}</button>)}</div>
    <div className="product-grid">{category.items.map((item) => <article className="farm-product" key={item.name}><img src={item.image} alt={item.name} loading="lazy" width="900" height="700" /><div className="farm-product-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><strong>{item.price}</strong><button className="button button-outline" type="button">Add to order</button></div></article>)}</div>
  </section>
}
