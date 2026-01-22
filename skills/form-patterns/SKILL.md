---
name: form-patterns
description: Form UX patterns including validation timing, field layouts, error handling, and multi-step wizard forms
license: MIT
---

# Form UX Patterns

Forms are the primary way users input data. Good form UX reduces friction and errors.

## Form Field Component

### Standard Field Structure
```tsx
interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text-primary"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1" role="alert">
          <AlertIcon className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
```

## Input Components

### Text Input
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: ReactNode;
}

function Input({ error, icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        className={`
          w-full px-3 py-2 bg-surface-deep border rounded-lg text-white text-sm
          placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-border'}
          ${className || ''}
        `}
        {...props}
      />
    </div>
  );
}
```

### Textarea
```tsx
function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full px-3 py-2 bg-surface-deep border rounded-lg text-white text-sm
        placeholder:text-text-muted resize-y min-h-[100px]
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
        ${error ? 'border-red-500' : 'border-border'}
        ${className || ''}
      `}
      {...props}
    />
  );
}
```

### Select
```tsx
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}

function Select({ options, placeholder, error, className, ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full px-3 py-2 bg-surface-deep border rounded-lg text-white text-sm
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
        ${error ? 'border-red-500' : 'border-border'}
        ${className || ''}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

### Checkbox / Radio
```tsx
function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label className={`
      flex items-center gap-2 cursor-pointer
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-4 h-4 rounded border-border bg-surface-deep
          text-accent focus:ring-accent focus:ring-offset-0
          checked:bg-accent checked:border-accent
        "
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  );
}
```

## Validation Timing

### When to Validate

| Timing | Use For | Example |
|--------|---------|---------|
| On blur | Most fields | Email format after leaving field |
| On change (debounced) | Real-time feedback | Password strength |
| On submit | Final validation | All fields before submit |
| Async | Server validation | Username availability |

### Validation Pattern
```tsx
function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validators: Record<keyof T, (value: any, data: T) => string | undefined>
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((field: keyof T) => {
    const validator = validators[field];
    if (validator) {
      const error = validator(data[field], data);
      setErrors(prev => ({ ...prev, [field]: error }));
      return !error;
    }
    return true;
  }, [data, validators]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  }, [validateField]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error on change if field was touched
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [touched]);

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    for (const field of Object.keys(validators) as (keyof T)[]) {
      const error = validators[field](data[field], data);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    setTouched(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [data, validators]);

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    setData,
    reset: () => {
      setData(initialData);
      setErrors({});
      setTouched({});
    },
  };
}

// Usage
const { data, errors, handleChange, handleBlur, validateAll } = useFormValidation(
  { email: '', password: '' },
  {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
    },
  }
);
```

## Form Layout Patterns

### Single Column Form
```tsx
// Default for most forms - stack fields vertically
<form className="space-y-4 max-w-md">
  <FormField label="Name" htmlFor="name" required>
    <Input id="name" />
  </FormField>
  
  <FormField label="Email" htmlFor="email" required>
    <Input id="email" type="email" />
  </FormField>
  
  <FormField label="Message" htmlFor="message">
    <Textarea id="message" />
  </FormField>
</form>
```

### Two Column Form
```tsx
// For related fields that fit together
<form className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField label="First Name" htmlFor="firstName">
      <Input id="firstName" />
    </FormField>
    <FormField label="Last Name" htmlFor="lastName">
      <Input id="lastName" />
    </FormField>
  </div>
  
  <FormField label="Email" htmlFor="email">
    <Input id="email" type="email" />
  </FormField>
</form>
```

### Sectioned Form
```tsx
// For long forms with logical groupings
<form className="space-y-8">
  <FormSection title="Personal Information" description="Your basic details">
    <FormField label="Name" htmlFor="name">
      <Input id="name" />
    </FormField>
  </FormSection>
  
  <FormSection title="Contact Information" description="How we can reach you">
    <FormField label="Email" htmlFor="email">
      <Input id="email" type="email" />
    </FormField>
  </FormSection>
</form>

function FormSection({ title, description, children }) {
  return (
    <div className="border-b border-border pb-6">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
```

## Form Submission States

### Submit Button States
```tsx
interface SubmitButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  loadingText?: string;
  children: ReactNode;
}

function SubmitButton({ isLoading, isDisabled, loadingText = 'Saving...', children }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={isLoading || isDisabled}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Spinner className="w-4 h-4 mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
```

### Form Action Bar
```tsx
function FormActionBar({ onCancel, isLoading, isDirty, submitLabel = 'Save' }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <SubmitButton isLoading={isLoading} isDisabled={!isDirty}>
        {submitLabel}
      </SubmitButton>
    </div>
  );
}
```

## Error Handling

### Form-Level Error
```tsx
{formError && (
  <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg" role="alert">
    <div className="flex items-start gap-3">
      <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-400">
          There was a problem with your submission
        </p>
        <p className="text-sm text-red-400/80 mt-1">{formError}</p>
      </div>
    </div>
  </div>
)}
```

### Field Error Summary
```tsx
// Show at top of form when there are errors
{Object.keys(errors).length > 0 && (
  <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg" role="alert">
    <p className="text-sm font-medium text-red-400 mb-2">
      Please fix the following errors:
    </p>
    <ul className="list-disc list-inside text-sm text-red-400/80 space-y-1">
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>{error}</li>
      ))}
    </ul>
  </div>
)}
```

## Success States

### Inline Success
```tsx
{isSuccess && (
  <div className="p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg" role="status">
    <div className="flex items-center gap-3">
      <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
      <p className="text-sm text-emerald-400">
        Changes saved successfully!
      </p>
    </div>
  </div>
)}
```

## Multi-Step Form (Wizard)

### Step Progress Indicator
```tsx
function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const status = index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming';
        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium
              ${status === 'complete' ? 'bg-accent text-white' :
                status === 'current' ? 'bg-accent/20 border-2 border-accent text-accent' :
                'bg-surface-raised text-text-muted'}
            `}>
              {status === 'complete' ? <CheckIcon className="w-5 h-5" /> : index + 1}
            </div>
            
            {/* Step label */}
            <span className={`ml-3 text-sm font-medium hidden sm:block
              ${status === 'current' ? 'text-white' : 'text-text-secondary'}
            `}>
              {step}
            </span>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-4
                ${index < currentStep ? 'bg-accent' : 'bg-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Wizard Form Component
```tsx
function WizardForm<T>({
  steps,
  initialData,
  onComplete,
  renderStep,
  validateStep,
}: WizardFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<T>(initialData);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const errors = validateStep?.(currentStep, data);
    if (errors && Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStepErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const errors = validateStep?.(currentStep, data);
    if (errors && Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <StepIndicator steps={steps.map(s => s.title)} currentStep={currentStep} />
      
      <div className="min-h-[300px]">
        {renderStep(currentStep, data, setData, stepErrors)}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={isFirstStep || isSubmitting}
          className={isFirstStep ? 'invisible' : ''}
        >
          Back
        </Button>
        
        {isLastStep ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Complete'}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Accessibility Requirements

### Required Field Indication
```tsx
// Announce required fields to screen readers
<label>
  Email
  <span className="text-red-400 ml-1" aria-label="required">*</span>
</label>
```

### Error Association
```tsx
<input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : hint ? 'email-hint' : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
{hint && !error && <p id="email-hint">{hint}</p>}
```

### Form Instructions
```tsx
// Announce form requirements at the top
<p className="text-sm text-text-secondary mb-4">
  Fields marked with <span className="text-red-400">*</span> are required.
</p>
```

## Audit Checklist for Forms

- [ ] All fields have visible labels
- [ ] Required fields are marked
- [ ] Error messages are clear and specific
- [ ] Errors appear next to relevant field
- [ ] Validation timing is appropriate
- [ ] Form has loading state during submission
- [ ] Success/error feedback after submission
- [ ] Cancel button doesn't submit form
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Form can be submitted with Enter key
- [ ] Long forms are sectioned or multi-step
- [ ] Password fields have visibility toggle
- [ ] Autofill attributes are correct
- [ ] Form resets properly after submission
- [ ] Dirty state tracked for unsaved changes warning
