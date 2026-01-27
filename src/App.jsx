import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function App() {
  const [formData, setFormData] = useState({
    username: "wayne20003106@gmail.com",
    password: "HdKJjYdWaA2HcF3",
  });
  const [isLogin, setIsLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const getData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      getData();
      setIsLogin(true);
    } catch (error) {
      setIsLogin(false);
      console.error(error.response?.data);
    }
  };

  // 檢查登入狀態
  const checkLogin = useCallback(async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      console.log("目前 Token：", token);
      if (token) {
        axios.defaults.headers.common.Authorization = token;
        const res = await axios.post(`${API_BASE}/api/user/check`);
        console.log("Token 驗證結果：", res.data);
        return true;
      }
    } catch (error) {
      console.error("Token 驗證失敗：", error.response?.data);
    }
    return false;
  }, []);

  useEffect(() => {
    const init = async () => {
      const isValid = await checkLogin();
      if (isValid) {
        setIsLogin(true);
        getData();
      }
    };
    init();
  }, [checkLogin]);

  const handleLogout = () => {
    // 1. 清除 Axios Header
    delete axios.defaults.headers.common["Authorization"];

    // 2. 清除 Cookie
    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // 3. 重置所有 React 狀態 (大掃除)
    setIsLogin(false);
    setProducts([]); // 清空列表
    setTempProduct(null); // 清空細節
  };
  // 如果有登入
  if (isLogin) {
    return (
      <div className="container">
        <div className="row mt-5">
          <div className="col-md-6">
            <h2>產品列表</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>查看細節</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button className="btn btn-primary" onClick={() => setTempProduct(item)}>
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <h2>單一產品細節</h2>
            {tempProduct ? (
              <div className="card mb-3">
                <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt="主圖" />
                <div className="card-body">
                  <h5 className="card-title">
                    {tempProduct.title}
                    <span className="badge bg-primary ms-2">{tempProduct.category}</span>
                  </h5>
                  <p className="card-text">商品描述：{tempProduct.description}</p>
                  <p className="card-text">商品內容：{tempProduct.content}</p>
                  <div className="d-flex">
                    <p className="card-text text-secondary">
                      <del>{tempProduct.origin_price}</del>
                    </p>
                    元 / {tempProduct.price} 元
                  </div>
                  <h5 className="mt-3">更多圖片：</h5>
                  <div className="d-flex flex-wrap">
                    {tempProduct.imagesUrl?.map((url, index) => (
                      <img key={index} src={url} className="images" alt="副圖" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-secondary">請選擇一個商品查看</p>
            )}
          </div>
        </div>
        <button className="btn btn-danger mb-5" type="button" onClick={() => handleLogout()}>
          登出
        </button>
      </div>
    );
  }

  // 如果沒有登入
  return (
    <div className="container login">
      <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="username"
            name="username"
            placeholder="name@example.com"
            value={formData.username}
            onChange={(e) => {
              handleInputChange(e);
            }}
            required
          />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => {
              handleInputChange(e);
            }}
            required
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="btn btn-lg btn-primary w-100 mt-3">
          Sign in
        </button>
      </form>
    </div>
  );
}

export default App;
