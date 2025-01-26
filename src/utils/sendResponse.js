const responseSend = (res, status, message, data) => {
  res.status(status).send({
    code: status,
    message: message,
    data: data,
  });
};

export default responseSend;
