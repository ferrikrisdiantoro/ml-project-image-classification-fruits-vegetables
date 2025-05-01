import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';

const classes = [
  { name: "Anggur", imageUrl: "/image/an.jpg" },
  { name: "Apel", imageUrl: "/image/ap.jpg" },
  { name: "Bit", imageUrl: "/image/bi.jpg" },
  { name: "Bawang Merah", imageUrl: "/image/bm.jpg" },
  { name: "Bawang Putih", imageUrl: "/image/bp.jpg" },
  { name: "Bayam", imageUrl: "/image/by.jpg" },
  { name: "Cabai", imageUrl: "/image/cb.jpg" },
  { name: "Delima", imageUrl: "/image/de.jpg" },
  { name: "Jagung", imageUrl: "/image/ja.jpg" },
  { name: "Jahe", imageUrl: "/image/jah.jpg" },
  { name: "Jeruk", imageUrl: "/image/je.jpg" },
  { name: "Kacang Polong", imageUrl: "/image/ka.jpg" },
  { name: "Kedelai", imageUrl: "/image/ke.jpg" },
  { name: "Kembang Kol", imageUrl: "/image/kem.jpg" },
  { name: "Kentang", imageUrl: "/image/ken.jpg" },
  { name: "Kiwi", imageUrl: "/image/kiw.jpg" },
  { name: "Kubis", imageUrl: "/image/ku.jpg" },
  { name: "Lemon", imageUrl: "/image/lem.jpg" },
  { name: "Lobak", imageUrl: "/image/lob.jpg" },
  { name: "Mangga", imageUrl: "/image/mang.jpg" },
  { name: "Nanas", imageUrl: "/image/nan.jpg" },
  { name: "Paprika", imageUrl: "/image/pap.jpg" },
  { name: "Pir", imageUrl: "/image/pir.jpg" },
  { name: "Pisang", imageUrl: "/image/pis.jpg" },
  { name: "Selada", imageUrl: "/image/sel.jpg" },
  { name: "Semangka", imageUrl: "/image/sem.jpg" },
  { name: "Terong", imageUrl: "/image/te.png" },
  { name: "Timun", imageUrl: "/image/ti.jpg" },
  { name: "Tomat", imageUrl: "/image/to.jpg" },
  { name: "Turnip", imageUrl: "/image/tur.jpg" },
  { name: "Ubi Jalar", imageUrl: "/image/ubi.jpg" },
  { name: "Wortel", imageUrl: "/image/wo.jpg" }
];

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [inputUrl, setInputUrl] = useState('');
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [nutrition, setNutrition] = useState('');
  const [topNutrients, setTopNutrients] = useState([]);
  const [error, setError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const nutritionUnits = {
    energi: "kkal",
    lemak_total: "g",
    vitamin_a: "mcg",
    vitamin_b1: "mg",
    vitamin_b2: "mg",
    vitamin_b3: "mg",
    vitamin_c: "mg",
    karbohidrat_total: "g",
    protein: "g",
    serat_pangan: "g",
    kalium: "mg",
    fosfor: "mg",
    natrium: "mg",
    tembaga: "mg",
    besi: "mg",
    seng: "mg",
    b_karoten: "mcg",
    karoten_total: "mcg",
    air: "g",
    abu: "g",
  };

  const nutritionNames = {
    energi: "Energi",
    lemak_total: "Lemak Total",
    vitamin_a: "Vitamin A",
    vitamin_b1: "Vitamin B1",
    vitamin_b2: "Vitamin B2",
    vitamin_b3: "Vitamin B3",
    vitamin_c: "Vitamin C",
    karbohidrat_total: "Karbohidrat Total",
    protein: "Protein",
    serat_pangan: "Serat Pangan",
    kalium: "Kalium",
    fosfor: "Fosfor",
    natrium: "Natrium",
    tembaga: "Tembaga",
    besi: "Besi",
    seng: "Seng",
    b_karoten: "B-Karoten",
    karoten_total: "Karoten Total",
    air: "Air",
    abu: "Abu",
  };

  const handleUrlInput = (e) => {
    setInputUrl(e.target.value);
    setPreview(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setPrediction('');
    setConfidence(null);
    setNutrition('');
    setTopNutrients([]);
    setError(null);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setPrediction(result.class_name);
      setConfidence(result.confidence);
      setNutrition(result.nutrition_info);

      const akgValues = Object.entries(result.nutrition_info)
        .map(([key, value]) => ({ name: key, akg: value.akg }))
        .sort((a, b) => b.akg - a.akg)
        .slice(0, 3);

      setTopNutrients(akgValues);

    } catch (err) {
      setError("Error: Prediction failed. Please try again.");
      console.error("Error:", err);
    }
  };

  const startCamera = () => {
    setIsCameraOpen(true);
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: isFrontCamera ? "user" : "environment" }
    })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Failed to start camera", err);
      });
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const switchCamera = () => {
    setIsFrontCamera((prev) => !prev);
    stopCamera();
    startCamera();
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
      handleFile(file);
      stopCamera();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4">
        <div className="flex items-center bg-white rounded-full p-2 shadow-md max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="flex w-full items-center justify-center">
            <label className="flex text-gray-700 font-semibold px-4 py-2 rounded-full focus:outline-none text-sm md:text-base lg:text-lg cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              Unggah Gambar
            </label>
            <span className="text-gray-500 mx-4 text-sm md:text-base lg:text-lg">Or</span>
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-full focus:outline-none text-sm md:text-base lg:text-lg"
            >
              Buka Kamera
            </button>
          </div>
        </div>




      {/* Camera Interface */}
      {isCameraOpen && (
        <div className="relative bg-blue-500 rounded-lg p-4 mt-4" style={{ width: "300px" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold">Camera</span>
            <button onClick={switchCamera} className="bg-white rounded-full w-8 h-8">
              <div className="circle w-4 h-4 bg-blue-500 rounded-full mx-auto my-auto"></div>
            </button>
          </div>
          <video ref={videoRef} autoPlay className="rounded-lg w-full h-48 bg-black" />
          <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }} />
          <button onClick={captureImage} className="mt-2 text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
            Tangkap Gambar
          </button>
        </div>
      )}
  
      {/* Preview Gambar */}
      {preview && (
        <div>
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg my-6 w-96">
            <div className="m-2.5 overflow-hidden rounded-md h-80 flex justify-center items-center">
              <img className="w-full h-full object-cover" src={preview} alt="Preview" />
            </div>
          </div>


          
        </div>
      )}
  
      {/* Bagian Prediction */}
      {prediction && (
        <div>
            <div className="flex flex-col space-y-2">
              <div className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                  <p className="text-xl">Prediksi : {prediction}</p>
              </div>
              <div className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              <p className="text-xl">Keyakinan: {confidence.toFixed(2)}%</p>
              </div>
            </div>

            <div className="flex flex-col bg-white p-6 rounded-lg shadow-md mb-6 mt-4">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-5xl p-6">
                <span className="block">
                Ringkasan Gizi <span className="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
                {prediction}
                    </span>
                </span>
              </h3>
              {/* Use responsive grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                  <div className="text-blue-500 text-2xl mb-2"><i className="fas fa-bolt">⚡</i></div>
                  <div className="text-lg font-semibold">Energi</div>
                  <div className="text-3xl font-bold mt-2">
                    {nutrition && nutrition['energi'] ? nutrition['energi'].amount : '--'}
                    <span className="text-lg font-normal">kcal</span>
                  </div>
                </div>
                <div className="text-white bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                  <div className="text-red-500 text-2xl mb-2"><i className="fas fa-drumstick-bite">🍖</i></div>
                  <div className="text-lg font-semibold">Protein</div>
                  <div className="text-3xl font-bold mt-2">
                    {nutrition && nutrition['protein'] ? nutrition['protein'].amount : '--'}
                    <span className="text-lg font-normal">g</span>
                  </div>
                </div>
                <div className="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                  <div className="text-yellow-500 text-2xl mb-2"><i className="fas fa-tint">🧈</i></div>
                  <div className="text-lg font-semibold">Lemak</div>
                  <div className="text-3xl font-bold mt-2">
                    {nutrition && nutrition['lemak_total'] ? nutrition['lemak_total'].amount : '--'}
                    <span className="text-lg font-normal">g</span>
                  </div>
                </div>
                <div className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">
                  <div className="text-blue-500 text-2xl mb-2"><i className="fas fa-bread-slice">🍚</i></div>
                  <div className="text-lg font-semibold">Karbo</div>
                  <div className="text-3xl font-bold mt-2">
                    {nutrition && nutrition['karbohidrat_total'] ? nutrition['karbohidrat_total'].amount : '--'}
                    <span className="text-lg font-normal">g</span>
                  </div>
                </div>
              </div>
            </div>


          <div className="space-y-2 bg-white p-6 rounded-lg shadow-md mt-4 mb-4">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-5xl p-6">
          <span className="block">
          Zat Gizi Unggulan dalam <span className="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
          {prediction}
              </span>
          </span>
          </h3>
            <div className="flex space-x-4">
              {topNutrients.map((nutrient, index) => (
                <div
                  key={index}
                  className="flex-1 text-white bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-500 dark:focus:ring-teal-1000 font-medium rounded-lg text-sm px-4 py-4 text-center mb-2"
                >
                  <div className="flex justify-between w-full mb-2">
                    <span className="font-bold">{index + 1}</span>
                    <span className="font-bold">{nutrient.akg.toFixed(2)}%</span>
                  </div>
                  <span className="font-bold">{nutritionNames[nutrient.name]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 mb-4 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
  <div className="w-full max-w-3xl overflow-x-auto">
    <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-5xl p-4 text-center">
      <span className="block">
        Tabel Informasi Nilai Gizi <span className="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
          {prediction}
        </span>
      </span>
    </h3>
    <table className="w-full bg-white shadow-md rounded-xl border-collapse overflow-hidden">
      <thead>
        <tr className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-center">
          <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Nutrisi</th>
          <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Jumlah</th>
          <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Satuan</th>
          <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Akg%</th>
        </tr>
      </thead>
      <tbody className="text-blue-gray-900 text-center">
        {Object.entries(nutritionNames).map(([key, value]) => (
          <tr key={key} className="border-b border-blue-gray-200">
            <td className="py-3 px-2 sm:px-4">{nutritionNames[key]}</td>
            <td className="py-3 px-2 sm:px-4">{nutrition[key].amount}</td>
            <td className="py-3 px-2 sm:px-4">{nutritionUnits[key]}</td>
            <td className="py-3 px-2 sm:px-4">{nutrition[key]?.akg || '0'}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


        </div>
      )}
  
      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-200 text-red-600 p-4 rounded-lg my-4">
          {error}
        </div>
      )}
  
  <div className="mt-4 mb-5 container">
  <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-5xl p-6">
    <span className="block">
      <span className="text-transparent bg-clip-text bg-gradient-to-tr to-cyan-500 from-blue-600">
        Buah dan Sayuran
      </span>{" "}
      yang dapat di Prediksi
    </span>
  </h3>
  <Swiper
    grabCursor={true}
    loop={true}
    slidesPerView={2}
    spaceBetween={10}
    pagination={{ type: 'fraction' }} // Set pagination type to 'fraction'
    navigation // Enable navigation arrows
    modules={[Pagination, Navigation]}
    className="swiper_container max-w-[80%] lg:max-w-[60%]"
  >
    {classes.map((classItem, index) => (
      <SwiperSlide key={index}>
        <div className="relative text-white rounded-lg overflow-hidden cursor-pointer">
          <div
            className="h-[180px] lg:h-[280px] bg-cover bg-center"
            style={{ backgroundImage: `url(${classItem.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <h1 className="text-xl lg:text-2xl font-bold">{classItem.name}</h1>
          </div>
        </div>
      </SwiperSlide>
    ))}
    <div className="swiper-button-prev slider-arrow text-blue-500" />
    <div className="swiper-button-next slider-arrow text-blue-500" />
    <div className="swiper-pagination" />
  </Swiper>
</div>


    </div>
  );
}

export default ImageUploader;
