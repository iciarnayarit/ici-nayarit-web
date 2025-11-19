import type { SVGProps } from 'react';

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.1 0 183.2 0 241.2c0 70.7 60.8 128.5 160.8 128.5 33.7 0 70.1-21.7 89.5-21.7 20.8 0 49.4 20.7 81.5 20.7C362.2 369.9 416 324.9 416 268.7c0-36.7-16.4-64.4-50-84.8zM282.4 95.2c-2.3-34.9-25.2-61.9-52.8-61.9-29.3 0-54.8 25.2-56.1 58.1-2.3-34.9-25.2-61.9-52.8-61.9-29.3 0-54.8 25.2-56.1 58.1H282.4z" />
    </svg>
  );
}

export function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M325.3 234.3L104.6 13l280.8 161.2-79.1 60.1zM479.8 287.4L104.6 499l280.8-161.2-79.1-60.1zM104.6 13L280.8 174.2 104.6 499V13z" />
    </svg>
  );
}
