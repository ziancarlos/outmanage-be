import ResponseError from "../errors/ResponseError.js";
import {
  loginValidation,
  refreshValidation,
} from "../validations/AuthValidations.js";
import validate from "../validations/validation.js";
import sanitize from "sanitize-html";
import bcrypt from "bcrypt";
import prismaClient from "../utils/Database.js";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function createUserActivityLog(
  userId = null,
  ipAddress = null,
  activityType
) {
  return await prismaClient.userActivityLog.create({
    data: {
      userId,
      ipAddress,
      activityType,
    },
  });
}

function createAccessToken(userId, roleId) {
  return jwt.sign(
    {
      userId: userId,
      roleId: roleId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

async function login(req, ipAddress) {
  let { username, password } = validate(loginValidation, req);
  username = sanitize(username);

  const targetedUser = await prismaClient.user.findUnique({
    where: {
      username: username,
    },
    select: {
      userId: true,
      username: true,
      password: true,
      roleId: true,
      deletedAt: true,
    },
  });

  if (!targetedUser) {
    await createUserActivityLog(null, ipAddress, 0);

    throw new ResponseError(400, "Nama pengguna atau kata sandi tidak valid");
  }

  if (targetedUser.deletedAt !== null) {
    await createUserActivityLog(targetedUser.userId, ipAddress, 0);

    throw new ResponseError(400, "Nama pengguna atau kata sandi tidak valid");
  }

  const passwordMatch = await bcrypt.compare(password, targetedUser.password);
  if (!passwordMatch) {
    await createUserActivityLog(targetedUser.userId, ipAddress, 0);

    throw new ResponseError(400, "Nama pengguna atau kata sandi tidak valid");
  }

  const accessToken = createAccessToken(
    targetedUser.userId,
    targetedUser.roleId
  );

  const refreshToken = jwt.sign(
    {
      userId: targetedUser.userId,
      roleId: targetedUser.roleId,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  await prismaClient.user.update({
    where: {
      userId: targetedUser.userId,
    },
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });

  await createUserActivityLog(targetedUser.userId, ipAddress, 1);

  return {
    userId: targetedUser.userId,
    username: targetedUser.username,
    accessToken,
    refreshToken,
    roleId: targetedUser.roleId,
  };
}

const logout = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!user) {
    throw new ResponseError(404, "User tidak ditemukan");
  }

  return prismaClient.user.update({
    where: {
      userId: userId,
    },

    data: {
      accessToken: null,
      refreshToken: null,
    },
  });
};

const refresh = async (refreshTokenInput) => {
  const refreshToken = validate(refreshValidation, refreshTokenInput);

  const userByRefreshToken = await prismaClient.user.findFirst({
    where: {
      refreshToken: refreshToken,
    },

    select: {
      username: true,
      userId: true,
      roleId: true,
    },
  });

  if (!userByRefreshToken) {
    throw new ResponseError(400, "Token penyegaran tidak valid");
  }

  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (e) {
    throw new ResponseError(400, "Token penyegaran tidak valid");
  }

  const newAccessToken = createAccessToken(
    userByRefreshToken.userId,
    userByRefreshToken.roleId
  );

  await prismaClient.user.update({
    where: {
      userId: userByRefreshToken.userId,
    },

    data: {
      accessToken: newAccessToken,
    },
  });

  return {
    userId: userByRefreshToken.userId,
    username: userByRefreshToken.username,
    accessToken: newAccessToken,
    roleId: userByRefreshToken.roleId,
  };
};

export default { login, logout, refresh };
