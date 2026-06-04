const styles = {
  green:  'bg-green-100 text-green-800',
  amber:  'bg-amber-100 text-amber-800',
  red:    'bg-red-100 text-red-800',
  navy:   'bg-navy text-white',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  gray:   'bg-gray-100 text-gray-600',
  gold:   'bg-amber-100 text-amber-800'
}

export function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[color] || styles.gray} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    'Normal':    { color: 'green',  label: '● Normal' },
    'Caution':   { color: 'amber',  label: '● Caution' },
    'Critical':  { color: 'red',    label: '● Critical' },
    'Active':    { color: 'green',  label: 'Active' },
    'Inactive':  { color: 'gray',   label: 'Inactive' },
    'Outsourced':{ color: 'blue',   label: 'Outsourced' },
    'Paid':      { color: 'green',  label: 'Paid' },
    'Unpaid':    { color: 'red',    label: 'Unpaid' },
    'Partial':   { color: 'amber',  label: 'Partial' },
    'Open':      { color: 'red',    label: 'Open' },
    'Closed':    { color: 'green',  label: 'Closed' },
    'In Progress': { color: 'amber', label: 'In Progress' },
    'Draft':     { color: 'gray',   label: 'Draft' },
    'Approved':  { color: 'blue',   label: 'Approved' },
    'Ordered':   { color: 'purple', label: 'Ordered' },
    'In Transit':{ color: 'orange', label: 'In Transit' },
    'Received':  { color: 'green',  label: 'Received' },
    'Invoiced':  { color: 'navy',   label: 'Invoiced' }
  }
  const cfg = map[status] || { color: 'gray', label: status }
  return <Badge color={cfg.color}>{cfg.label}</Badge>
}
