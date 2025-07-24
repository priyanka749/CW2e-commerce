import fashionVideo from '../assets/images/..mp4';

const VideoHero = () => (
  <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg border-4 border-[#540b0e]">
    <video
      src={fashionVideo}
      autoPlay
      muted
      loop
      className="w-full h-full object-cover"
    />
    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#540b0e]/70 via-black/40 to-transparent">
      <h1 className="text-white text-5xl font-extrabold drop-shadow-lg mb-4 tracking-wide">
        Welcome to <span className="text-[#540b0e] bg-white/80 px-3 py-1 rounded-lg">Anka Attire</span>
      </h1>
      <p className="text-lg text-white/80 font-medium bg-[#540b0e]/80 px-6 py-2 rounded-full shadow mt-2">
        Discover your style. Try, shop, and shine.
      </p>
    </div>
  </div>
);

export default VideoHero;

