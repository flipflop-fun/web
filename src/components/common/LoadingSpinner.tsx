import { FC } from "react"

type LoadingSpinnerProps = {
  size?: number;
}
const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 7,
}) => {
  return (
    <div className={`animate-spin w-${size} h-${size} border-2 border-white rounded-full border-t-transparent`}></div>
  );
};

export default LoadingSpinner;
