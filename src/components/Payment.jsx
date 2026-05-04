import { useState } from 'react';
import { Phone, CheckCircle, CreditCard, FileDown } from 'lucide-react';
import { useGlobals } from "./Globals";

const Payment = () => {
    const [paymentStep, setPaymentStep] = useState('prompt');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const {setPaymentStatus, setCurrentView} = useGlobals();

    const initiatePayment = () => {
      setIsProcessing(true);
      setPaymentStep('processing');
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentStep('success');
        setPaymentStatus('completed');
      }, 3000);
    };

    const downloadFile = (format) => {
      // Simulate file download
      alert(`Downloading ${examData.title} as ${format.toUpperCase()}...`);
    };

    if (paymentStep === 'success') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your exam is ready for download</p>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 mb-2">{examData.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {examData.questions.length} questions • {examData.totalMarks} marks • {examData.duration} minutes
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => downloadFile('pdf')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadFile('docx')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Word
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('dashboard')}
              className="mt-6 text-green-600 hover:text-green-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (paymentStep === 'processing') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment...</h1>
            <p className="text-gray-600 mb-4">Please check your phone for M-Pesa prompt</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Complete Your Purchase</h1>
            <p className="text-gray-600">Pay Ksh 30 to download your exam</p>
          </div>
          <button
            onClick={() => setCurrentView('review-exam')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Review
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{examData.title}</h2>
              <p className="text-gray-600">
                {examData.questions.length} questions • {examData.totalMarks} marks
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">Ksh 30</p>
              <p className="text-sm text-gray-500">One-time fee</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-800 mb-2">M-Pesa Payment Instructions</h3>
            <ol className="text-sm text-green-700 space-y-1">
              <li>1. Go to M-Pesa menu on your phone</li>
              <li>2. Select "Lipa na M-Pesa"</li>
              <li>3. Select "Buy Goods and Services"</li>
              <li>4. Enter Till Number: <strong>0726426491</strong></li>
              <li>5. Enter Amount: <strong>30</strong></li>
              <li>6. Enter your M-Pesa PIN</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number (for payment verification)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                />
              </div>
            </div>

            <button
              onClick={initiatePayment}
              disabled={!phoneNumber || isProcessing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'I have completed M-Pesa payment'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Secure payment powered by Safaricom M-Pesa
            </p>
          </div>
        </div>
      </div>
    );
  };

  export default Payment;