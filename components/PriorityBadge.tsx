import { Badge } from "./ui/badge"


export function PriorityBadge({ pctLeft }: { pctLeft: number }) {
  let cls = 'bg-green-100 text-green-800 border border-green-200'
  if (pctLeft <= 66 && pctLeft > 33) cls = 'bg-amber-100 text-amber-800 border border-amber-200'
  if (pctLeft <= 33) cls = 'bg-red-100 text-red-800 border border-red-200'
  return <Badge className={cls}>{pctLeft}%</Badge>
}
