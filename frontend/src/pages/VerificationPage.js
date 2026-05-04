import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js"; 
import { ShieldCheck, Upload, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

const VerificationPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name?.toLowerCase() || ""; 

  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      performAIVerification(file);
    }
  };

  const performAIVerification = (file) => {
    setStatus("scanning");
    setErrorMsg("");

    Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m) 
    }).then(({ data: { text } }) => {
      const extractedText = text.toLowerCase();
      console.log("Extracted Text:", extractedText);

      const cnicRegex = /[0-9]{5}-[0-9]{7}-[0-9]{1}/;
      const hasCnicNumber = cnicRegex.test(extractedText);

      
      const hasNameMatch = extractedText.includes(userName);

      if (hasCnicNumber && hasNameMatch) {
        setStatus("success");
      } else if (!hasCnicNumber) {
        setStatus("failed");
        setErrorMsg("Invalid Card: No valid CNIC number detected.");
      } else if (!hasNameMatch) {
        setStatus("failed");
        setErrorMsg(`Name Mismatch: Card name does not match '${userName}'.`);
      } else {
        setStatus("failed");
        setErrorMsg("Verification failed. Please upload a clearer image of your original CNIC.");
      }
    }).catch(err => {
      console.error(err);
      setStatus("failed");
      setErrorMsg("AI processing error. Try again.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Smart Verify</h1>
          <p className="text-slate-500 text-sm mt-1">Verifying identity for: <b className="text-indigo-600">{userName}</b></p>
        </div>

        <div className={`relative border-2 border-dashed rounded-3xl p-6 transition-all min-h-[250px] flex flex-col items-center justify-center ${
          status === "success" ? "border-green-200 bg-green-50" : 
          status === "failed" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
        }`}>
          
          {status === "idle" && (
            <>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-500">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">Upload CNIC Front</p>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
            </>
          )}

          {status === "scanning" && (
            <div className="text-center">
              <Loader2 size={40} className="text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-black text-slate-800 animate-pulse">AI IS READING CARD...</p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Matching name & CNIC pattern</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-green-800">Identity Confirmed!</p>
              <p className="text-xs text-green-600 mt-1">CNIC & Username matched perfectly.</p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <XCircle size={48} className="text-red-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-red-800">Verification Failed</p>
              <p className="text-xs text-red-600 mt-1 px-4">{errorMsg}</p>
              <button onClick={() => setStatus("idle")} className="mt-4 text-xs font-bold text-red-700 underline uppercase">Try Again</button>
            </div>
          )}
        </div>

        <button
          disabled={status !== "success"}
          onClick={() => navigate("/dashboard")}
          className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-20 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;