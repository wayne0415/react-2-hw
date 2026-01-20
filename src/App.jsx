import { useState } from "react";
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

  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();
  // 目前選中的產品

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      const { token, expired } = response.data;
      // 儲存 Token 到 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = `${token}`;
      // 載入產品資料
      getData();

      // 更新登入狀態
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response?.data.message);
    }
  };

  const checkLogin = async () => {
    try {
      // 從 Cookie 取得 Token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      console.log("目前 Token：", token);

      if (token) {
        axios.defaults.headers.common.Authorization = token;

        // 驗證 Token 是否有效
        const res = await axios.post(`${API_BASE}/api/user/check`);
        console.log("Token 驗證結果：", res.data);
      }
    } catch (error) {
      console.error("Token 驗證失敗：", error.response?.data);
    }
  };

  // 取得產品資料
  const getData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      console.log("產品資料：", response.data);
      setProducts(response.data.products);
    } catch (err) {
      console.error("取得產品失敗：", err.response?.data?.message);
    }
  };
  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入 </h1>
          <form className="form-floating" onSubmit={(e) => handleSubmit(e)}>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={(e) => handleInputChange(e)} />
              <label htmlFor="userName">Email address</label>
            </div>
            <div className="form-floating">
              <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange(e)} />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-2">
            <div className="col-md-6">
              <button className="btn btn-danger mb-5" type="button" onClick={() => checkLogin()}>
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    return (
                      <tr key={product.id}>
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary "
                            onClick={() => {
                              setTempProduct(product);
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>產品明細</h2>
              {tempProduct ? (
                <div className="card">
                  <img src={tempProduct.imageUrl} className="card-img-top" alt="主圖" style={{ height: "300px" }} />
                  <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">商品描述：{tempProduct.description}</p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <del className="text-secondary">{tempProduct.origin_price}</del>元/{tempProduct.price}元
                    </div>
                    <h5 className="card-title">更多圖片</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img key={index} src={url} className="d-flex me-2" alt="更多圖片" style={{ height: "100px" }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇產品</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
