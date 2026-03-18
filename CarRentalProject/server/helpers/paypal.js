const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id:
    "ATTz-8xfK51-Zt_x89x4tis3KBZ_ywLxFQ8024W3WfEnhyPURWpwm6z5aJQsWc_8jocaRr5aKB0TC74c",
  client_secret:
    "EPXyYBtmiI93Xp1Q02AGjeObcNd127ZJqBm7idcBpRhuKCyqjP80Tqy2CLuqOoSj0m7d4G5gY-1pJlIi",
});

module.exports = paypal;
