import { Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '../../hooks/useVoiceInput'

export function FormField({ label, error, required, children, hint }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Input({ label, error, required, hint, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <input className="form-input" {...props} />
    </FormField>
  )
}

export function Select({ label, error, required, hint, options = [], placeholder, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <select className="form-select" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

export function VoiceTextarea({ label, error, required, hint, value, onChange, rows = 3, placeholder, name }) {
  const { listening, start, stop, supported } = useVoiceInput(transcript => {
    const e = { target: { name, value: (value ? value + ' ' : '') + transcript } }
    onChange(e)
  })

  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <div className="relative">
        <textarea
          className="form-textarea pr-12"
          rows={rows}
          value={value}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
        />
        {supported && (
          <button
            type="button"
            onClick={listening ? stop : start}
            className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${
              listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-navy hover:text-white'
            }`}
            title={listening ? 'Stop recording' : 'Start voice input'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>
    </FormField>
  )
}

export function NumberInput({ label, error, required, hint, prefix, suffix, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{prefix}</span>}
        <input
          type="number"
          className={`form-input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{suffix}</span>}
      </div>
    </FormField>
  )
}
