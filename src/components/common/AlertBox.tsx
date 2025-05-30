type AlertBoxProps = {
  title: string,
  message: string,
}

const AlertBox: React.FC<AlertBoxProps> = ({ title, message }) => {
  return (
    <div className="pixel-alert flex gap-3">
      <div className="text-white">
        <svg className='w-6 h-6' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M13 1h-2v2H9v2H7v2H5v2H3v2H1v2h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h-2V9h-2V7h-2V5h-2V3h-2V1zm0 2v2h2v2h2v2h2v2h2v2h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3v-2h2V9h2V7h2V5h2V3h2zm0 4h-2v6h2V7zm0 8h-2v2h2v-2z" fill="currentColor" /> </svg>
      </div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <div className="text-sm text-white">
          {message}
        </div>
      </div>
    </div>
  );
};
export default AlertBox;