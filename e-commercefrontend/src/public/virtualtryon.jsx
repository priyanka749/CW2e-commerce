import { BulbFilled, BulbOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    ConfigProvider,
    Input,
    Layout,
    Row,
    Select,
    Switch,
    Typography,
    theme
} from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUpload from "../components/ImageUpload";
import Footer from "../components/footer";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function Tryon() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [modelType, setModelType] = useState("");
  const [gender, setGender] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [style, setStyle] = useState("");

  const resultRef = useRef(null);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personImage || !clothImage) {
      toast.error("Please upload both images");
      return;
    }

    const formData = new FormData();
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("instructions", instructions);
    formData.append("model_type", modelType || "");
    formData.append("gender", gender || "");
    formData.append("garment_type", garmentType || "");
    formData.append("style", style || "");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/try-on", formData);
      const data = res.data;

      const newResult = {
        id: Date.now(),
        resultImage: data.image,
        text: data.text,
        timestamp: new Date().toLocaleString(),
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
      toast.success("Try-On Complete!");
    } catch (err) {
      console.error(err);
      toast.error("Try-On Failed: " + (err.response?.data?.detail || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDarkMode ? "#1B1A17" : "#f5f3f0";
  const cardColor = isDarkMode ? "#2C2B28" : "#fff8f0";
  const textColor = isDarkMode ? "#ffffff" : "#3B2F2F";
  const subText = isDarkMode ? "#bcbcbc" : "#5c4333";
  const primaryColor = "#540b0e";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: { colorPrimary: primaryColor, borderRadius: 10 },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: bgColor }}>
        <Header style={{ background: "transparent", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={3} style={{ color: textColor, margin: 0 }}>✨Try-On</Title>
          <Switch checked={isDarkMode} onChange={setIsDarkMode} checkedChildren={<BulbFilled />} unCheckedChildren={<BulbOutlined />} />
        </Header>

        <Content style={{ padding: "2rem 1rem" }}>
          <div style={{ maxWidth: "95%", margin: "0 auto" }}>
            <Title level={1} style={{ color: textColor, textAlign: "center", marginBottom: 40 }}>Try Your Clothes </Title>

            <form onSubmit={handleSubmit}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card style={{ background: cardColor, borderRadius: 16 }}>
                    <Title level={4} style={{ color: textColor }}>Model Image</Title>
                    <ImageUpload label="Upload Model Image" onImageChange={setPersonImage} isDarkMode={isDarkMode} />
                    <Text style={{ color: subText }}>Model Type</Text>
                    <Select style={{ width: "100%", marginBottom: 16 }} value={modelType} onChange={setModelType}>
                      <Option value="top">Top Half</Option>
                      <Option value="bottom">Bottom Half</Option>
                      <Option value="full">Full Body</Option>
                    </Select>

                    <Text style={{ color: subText }}>Gender</Text>
                    <Select style={{ width: "100%" }} value={gender} onChange={setGender}>
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="unisex">Unisex</Option>
                    </Select>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card style={{ background: cardColor, borderRadius: 16 }}>
                    <Title level={4} style={{ color: textColor }}>Cloth Image</Title>
                    <ImageUpload label="Upload Cloth Image" onImageChange={setClothImage} isDarkMode={isDarkMode} />

                    <Text style={{ color: subText }}>Garment Type</Text>
                    <Select style={{ width: "100%", marginBottom: 16 }} value={garmentType} onChange={setGarmentType}>
                      <Option value="Kurtha">Saree</Option>
                      <Option value="saree">lehenga</Option>
                      <Option value="lehenga">Cord set</Option>
                      <Option value="cordset">Dress</Option>
                      <Option value="Fusion">Kurtha</Option>
                    </Select>

                    <Text style={{ color: subText }}>Style</Text>
                    <Select style={{ width: "100%" }} value={style} onChange={setStyle}>
                      <Option value="casual">Casual</Option>
                      <Option value="formal">Formal</Option>
                      <Option value="designer">designer</Option>
                      <Option value="traditional">Traditional</Option>
                      <Option value="stylist">stylist</Option>
                    </Select>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 32 }}>
                <Text style={{ color: textColor, fontWeight: 600 }}>Special Instructions</Text>
                <Input.TextArea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} style={{ background: cardColor, color: textColor }} />
              </div>

              <div style={{ marginTop: 32, textAlign: "center" }}>
                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  {loading ? "Processing..." : "Try On Now"}
                </Button>
              </div>
            </form>

            {result && (
              <div ref={resultRef} style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
                <Card style={{ background: cardColor, padding: 24, borderRadius: 20, boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)", maxWidth: 400, textAlign: "center" }}>
                  <Title level={4} style={{ color: textColor, marginBottom: 16 }}>Try-On Result</Title>
                  <img
                    src={result.resultImage}
                    alt="Try-On Result"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 16,
                      objectFit: "cover",
                      marginBottom: 16,
                      border: `3px solid ${primaryColor}`
                    }}
                  />
                  <Text style={{
                    display: "block",
                    color: textColor,
                    fontSize: "1rem"
                  }}>
                    {result.text || "No Description available."}
                  </Text>
                </Card>
              </div>
            )}
          </div>
        </Content>

        <Footer isDarkMode={isDarkMode} />
        <ToastContainer theme={isDarkMode ? "dark" : "light"} />
      </Layout>
    </ConfigProvider>
  );
}

export default Tryon;
