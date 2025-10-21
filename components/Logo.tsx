import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  showText?: boolean;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = 120,
  height = 40,
  className = '',
  priority = false,
  showText = false,
  href = '/'
}) => {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo-logen.png"
        alt="Logen Logo"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
      />
      {showText && (
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
          Logen
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;