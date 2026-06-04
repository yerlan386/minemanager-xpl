export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none'
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light',
    gold:    'bg-gold text-navy hover:bg-gold-light',
    outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-white',
    ghost:   'text-navy hover:bg-gray-100',
    danger:  'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  }
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
