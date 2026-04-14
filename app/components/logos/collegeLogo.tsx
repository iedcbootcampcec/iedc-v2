import Image from "next/image";

export default function collegeLogo({ size = 2 }) {
  return (
    <Image
      src="/logos/college-logo.png"
      height={size}
      width={size}
      alt="college of engineering chengannur"
    />
  );
}
