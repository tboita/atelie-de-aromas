import { useEffect, useState } from 'react'

/* Campo numérico que só repassa valores maiores que zero, sem travar a digitação */
export default function NumInput({ value, onValue, ...p }) {
  const [txt, setTxt] = useState(value == null ? '' : String(value))
  useEffect(() => { if (+txt !== value) setTxt(value == null ? '' : String(value)) }, [value]) // eslint-disable-line
  return <input type="number" inputMode="decimal" value={txt}
    onChange={e => { setTxt(e.target.value); const x = +e.target.value; if (x > 0) onValue(x) }} {...p} />
}
