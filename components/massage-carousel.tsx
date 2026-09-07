"use client"

import { useEffect, useState } from "react"

const slides = [
  { type: "Swedish Massage", duration: "60 or 90 minutes", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80", text: "Long, flowing strokes designed to settle the nervous system and restore easy movement." },
  { type: "Deep Tissue", duration: "60 minutes", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80", text: "Focused therapeutic work for persistent tension, overworked muscles, and everyday aches." },
  { type: "Hot Stone", duration: "75 minutes", image: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1200&q=80", text: "Heated basalt stones and intentional pressure invite warmth into places that feel held." },
  { type: "Prenatal Massage", duration: "60 minutes", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80", text: "Supportive, side-lying care for changing bodies, tired legs, and a little more rest." },
  { type: "Aromatherapy", duration: "60 minutes", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80", text: "A sensory reset pairing gentle bodywork with a custom botanical oil blend." },
  { type: "Reflexology", duration: "45 minutes", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80", text: "Precise foot and lower-leg work to help you feel grounded from the soles up." },
]

export function MassageCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 4000)
    return () => window.clearInterval(timer)
  }, [])

  const slide = slides[active]

  return (
    <section className="massage-carousel" aria-label="Massage types">
      <div className="massage-carousel-image-wrap">
        <img className="massage-carousel-image" src={slide.image} alt={`${slide.type} massage treatment`} loading={active === 0 ? "eager" : "lazy"} />
        <div className="carousel-controls">
          <button type="button" className="carousel-control" aria-label="Previous massage type" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>‹</button>
          <button type="button" className="carousel-control" aria-label="Next massage type" onClick={() => setActive((active + 1) % slides.length)}>›</button>
        </div>
      </div>
      <div className="massage-carousel-copy">
        <p className="eyebrow">{slide.duration}</p>
        <h2>{slide.type}</h2>
        <p>{slide.text}</p>
        <div className="carousel-dots" role="tablist" aria-label="Choose a massage type">
          {slides.map((item, index) => <button key={item.type} type="button" className={`carousel-dot ${index === active ? "is-active" : ""}`} role="tab" aria-selected={index === active} aria-label={item.type} onClick={() => setActive(index)} />)}
        </div>
      </div>
    </section>
  )
}
