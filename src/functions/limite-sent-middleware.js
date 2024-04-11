const LimiteSentMiddleware = (limite, tiempoLimite) => {
  let emailSent = 0;
  let timeLatestSent = Date.now();

  const middleware = (add_value) => (req, res, next) => {
    const tiempoTranscurrido = Date.now() - timeLatestSent;

    if (tiempoTranscurrido >= tiempoLimite) {
      emailSent = 0;
      timeLatestSent = Date.now();
    }

    if (emailSent < limite) {
      emailSent += add_value;
      next();
    } else {
      res.status(429).json({
        error: `Se ha alcanzado el límite de ${limite} correos enviados en las últimas ${
          tiempoLimite / 1000 / 60
        } minutos.`,
      });
    }
  };

  const getStatus = () => {
    return {
      emailSent,
      //  resultado en segundos
      elapsedTime: Math.trunc(
        (tiempoLimite - (Date.now() - timeLatestSent)) / 1000
      ),
      status: limite > emailSent,
    };
  };

  return { middleware, getStatus };
};

export default LimiteSentMiddleware;
