"use client"

import { useState } from "react"
import { SelectWinner } from "@/components/select-winner"
import { ExtractIntent } from "@/components/extract-intent"
import { DefineVariationSpace } from "@/components/define-variation-space"
import { RealityCheck, type VariationAxis } from "@/components/reality-check"
import { GeneratePacks } from "@/components/generate-packs"
import { ReviewApprove } from "@/components/review-approve"
import { ExportComplete } from "@/components/export-complete"
import { FlowHeader } from "@/components/flow-header"

export type FlowStep =
  | "select-winner"
  | "extract-intent"
  | "define-variation-space"
  | "reality-check"
  | "generate-packs"
  | "review-approve"
  | "export-complete"

export interface CreativeIntent {
  nonNegotiables: {
    coreMessage: string
    promise: string
    proof: string
  }
  flexibleDimensions: {
    hook: { value: string; locked: boolean }
    actor: { value: string; locked: boolean }
    environment: { value: string; locked: boolean }
    format: { value: string; locked: boolean }
    pacing: { value: string; locked: boolean }
    script: { value: string; locked: boolean }
    voiceover: { value: string; locked: boolean }
    onScreenText: { value: string; locked: boolean }
  }
}

export interface VariationCluster {
  id: string
  hypothesis: string
  dimension: string
  variationCount: number
  approved: boolean | null
  variations: {
    id: string
    thumbnail: string
    description: string
  }[]
}

export default function UnrealLabs() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("select-winner")
  const [selectedAd, setSelectedAd] = useState<string | null>(null)
  const [creativeIntent, setCreativeIntent] = useState<CreativeIntent | null>(null)
  const [variationAxes, setVariationAxes] = useState<VariationAxis[]>([])
  const [clusters, setClusters] = useState<VariationCluster[]>([])
  const [approvedCount, setApprovedCount] = useState(0)

  const handleSelectAd = (adId: string) => {
    setSelectedAd(adId)
    setCurrentStep("extract-intent")
  }

  const handleIntentExtracted = (intent: CreativeIntent) => {
    setCreativeIntent(intent)
    setCurrentStep("define-variation-space")
  }

  const handleVariationSpaceDefined = (axes: VariationAxis[]) => {
    setVariationAxes(axes)
    setCurrentStep("reality-check")
  }

  const handleRealityCheckApproved = () => {
    setCurrentStep("generate-packs")
  }

  const handleRealityCheckRejected = () => {
    setCurrentStep("define-variation-space")
  }

  const handlePacksGenerated = (generatedClusters: VariationCluster[]) => {
    setClusters(generatedClusters)
    setCurrentStep("review-approve")
  }

  const handleReviewComplete = (approved: number) => {
    setApprovedCount(approved)
    setCurrentStep("export-complete")
  }

  const handleStartOver = () => {
    setCurrentStep("select-winner")
    setSelectedAd(null)
    setCreativeIntent(null)
    setVariationAxes([])
    setClusters([])
    setApprovedCount(0)
  }

  return (
    <main className="min-h-screen bg-background">
      <FlowHeader currentStep={currentStep} onStartOver={handleStartOver} />

      <div className="pt-16">
        {currentStep === "select-winner" && <SelectWinner onSelect={handleSelectAd} />}

        {currentStep === "extract-intent" && selectedAd && (
          <ExtractIntent
            adId={selectedAd}
            onComplete={handleIntentExtracted}
            onBack={() => setCurrentStep("select-winner")}
          />
        )}

        {currentStep === "define-variation-space" && creativeIntent && (
          <DefineVariationSpace
            intent={creativeIntent}
            setIntent={setCreativeIntent}
            onComplete={handleVariationSpaceDefined}
            onBack={() => setCurrentStep("extract-intent")}
          />
        )}

        {currentStep === "reality-check" && creativeIntent && (
          <RealityCheck
            intent={creativeIntent}
            axes={variationAxes}
            onApprove={handleRealityCheckApproved}
            onReject={handleRealityCheckRejected}
            onBack={() => setCurrentStep("define-variation-space")}
          />
        )}

        {currentStep === "generate-packs" && creativeIntent && (
          <GeneratePacks intent={creativeIntent} onComplete={handlePacksGenerated} />
        )}

        {currentStep === "review-approve" && (
          <ReviewApprove
            clusters={clusters}
            setClusters={setClusters}
            onComplete={handleReviewComplete}
            onBack={() => setCurrentStep("define-variation-space")}
          />
        )}

        {currentStep === "export-complete" && (
          <ExportComplete approvedCount={approvedCount} clusters={clusters} onStartOver={handleStartOver} />
        )}
      </div>
    </main>
  )
}
