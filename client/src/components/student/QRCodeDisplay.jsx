import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ value, size = 200, title = 'Scan for Pickup' }) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 glass rounded-2xl">
      <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{title}</h3>
      <div className="p-4 bg-white rounded-2xl shadow-inner">
        <QRCodeSVG value={value || 'N/A'} size={size} level="H" includeMargin />
      </div>
      <p className="text-sm text-surface-500 text-center">Show this QR code at the counter to collect your order</p>
    </div>
  );
};

export default QRCodeDisplay;
