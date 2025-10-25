import React from 'react'
import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you&apos;re ready to scale
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  )
}