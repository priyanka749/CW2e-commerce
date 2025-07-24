import { useNavigate } from 'react-router-dom';
import about1 from '../assets/images/about.jpg'; // hands photo
import about2 from '../assets/images/about2.png'; // tall image
import about3 from '../assets/images/about3.png'; // used twice
import Footer from '../components/footer';
import Navbar from '../components/nav';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FFF9F3] text-[#3C2A1E] font-[sans-serif] min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Top Section */}
      <section className="px-6 py-10 md:px-20 md:py-16 flex flex-col md:flex-row items-center gap-10">
        <img
          src={about1}
          alt="About Hands"
          className="w-full md:w-1/2 rounded-lg object-cover shadow-md"
        />
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold text-[#540b0e] mb-6">Anka Attire</h1>
          <p className="text-[1.5rem] leading-[2rem] tracking-wide font-medium">
            Anka Attire is a modern ethnic wear brand that 
            celebrates timeless tradition with a
            contemporary spirit. We present a curated range of sarees, kurtis, and festive ensembles
            designed for today's woman confident, expressive, and rooted in culture. With premium
            craftsmanship and intricate detailing, each outfit reflects elegance, identity, and grace.
          </p>
        </div>
      </section>

      {/* Center Title */}
      <section className="text-center py-11">
        <h2 className="text-3xl md:text-4xl font-bold text-[#540b0e] tracking-wide">
          Grace in Every Thread
        </h2>
      </section>

      {/* Story + Overlapping Images Section */}
      <section className="px-26 py-4pb-10 md:px-30 flex flex-col md:flex-row gap-20 items-start">
        {/* Text */}
        <div className="md:w-1/2 py-30 text-[1.6rem] leading-[2rem] tracking-wide font-medium">
          <p>
            At Anka Attire, we believe fashion is more than fabric 
            it's a feeling. It's the quiet
            confidence when a woman drapes a saree,
             the connection she feels slipping into a kurti,
            and the joy of dressing for celebration. 
            Our pieces are not just worn they are felt,lived,
             and remembered.Rooted in heritage, yet styled for the modern soul,
              every ensemble reflects individuality with a touch of tradition.
               Because at Anka Attire, we don't just dress bodies  we adorn
            stories.
            </p>
          

          <button className="mt-15 px-10 py-2.5 bg-[#540b0e] text-white text-base font-semibold rounded-full shadow-md hover:bg-[#3a0708] transition-all duration-200" onClick={() => navigate('/products')}>
            Shop Now
          </button>
        </div>

        {/* Images with Overlap */}
        <div className="md:w-1/2 flex flex-col items-center gap-4">
          {/* Main tall image */}
          <img
            src={about2}
            alt="Main Cultural"
            className="relative h-[580px] w-[80%] rounded-md object-cover shadow-md"
          />

          {/* Overlapping Image */}
          <div className="relative w-[70%] h-[200px] mt-6">
            <img
              src={about3}
              alt="Bottom Image Foreground"
              className="absolute bottom-30 right-10 w-[70%] rounded-md object-cover shadow-xl z-10"
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="text-center py-6 text-sm text-[#3C2A1E]">
        <p>ankaattire@gmail.com | 9862182135</p>
        <div className="flex justify-center gap-4 mt-2 text-[#540b0e] text-lg">
          <a href="#"><i className="fab fa-instagram"></i> @anka_attire</a>
          <a href="#"><i className="fab fa-facebook"></i> anka.attire</a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
