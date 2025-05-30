<template>
  <div class="customer-register">
    <div class="header-row">
      <h2 class="section-title">기본 정보 <span class="required">*</span></h2>
      <button class="register-button">등록</button>
    </div>

    <div class="form-box">
      <form>
        <div class="form-grid">
          <div class="form-item">
            <label>고객명</label>
            <input type="text" />
          </div>
          <div class="form-item">
            <label>생년월일</label>
            <input type="date" />
          </div>
          <div class="form-item">
            <label>연락처</label>
            <input type="text" />
          </div>
          <div class="form-item">
            <label>이메일</label>
            <input type="email" />
          </div>
          <div class="form-item full-width">
            <label>주소</label>
            <input type="text" />
          </div>
          <div class="form-item">
            <label>구분</label>
            <select>
              <option>리드</option>
              <option>고객</option>
            </select>
          </div>
          <div class="form-item">
            <label>고객 등록일</label>
            <input type="date" />
          </div>
          <div class="form-item full-width">
            <label>비고</label>
            <textarea rows="4"></textarea>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.customer-register {
  padding: 24px;
  border-radius: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.required {
  color: #d32f2f;
  font-size: 18px;
  margin-left: 6px;
}

.register-button {
  border: 1px solid #ccc;
  padding: 8px 20px;
  font-size: 14px;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-button:hover {
  background-color: #f5f5f5;
}

.form-box {
  background-color: white;
  border-radius: 6px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 4;
}

label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

input,
select,
textarea {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.2);
}
</style>
