import AuthService from "../services/AuthServices.js";

async function login(req, res, next) {
  try {
    const { body } = req;

    const { userId, username, accessToken, refreshToken, roleId } =
      await AuthService.login(body, req.ip);

    res.cookie("refreshToken", refreshToken, {
      secure: false,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log(refreshToken);

    res.status(200).json({
      data: { userId, username, accessToken, roleId },
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    const { userId } = req.user;

    await AuthService.logout(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({
      data: "Ok",
    });
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    console.log(refreshToken);

    const { userId, username, accessToken, roleId } = await AuthService.refresh(
      refreshToken
    );

    res.status(200).json({
      data: {
        userId,
        username,
        accessToken,
        roleId,
      },
    });
  } catch (e) {
    next(e);
  }
}

export default { login, logout, refresh };
