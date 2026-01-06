interface CheckoutProgressStepsProps {
  currentStep: number
}

export default function CheckoutProgressSteps({
  currentStep,
}: CheckoutProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Liên hệ' },
    { number: 2, label: 'Địa chỉ' },
    { number: 3, label: 'Thanh toán' },
  ]

  return (
    <div className="mb-5 flex justify-center">
      <div className="flex items-center space-x-3">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step.number <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-3 h-1 w-12 rounded transition-colors ${
                  step.number < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
