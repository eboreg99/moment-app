const src = `${import.meta.env.BASE_URL}favicon.svg`

export function Logo({ size = 28 }: { size?: number }) {
  return <img src={src} width={size} height={size} alt="" className="logo" />
}
