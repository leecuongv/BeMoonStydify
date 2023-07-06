const bcrypt = require("bcrypt")
const User = require("../models/User.js")
const mongoose = require("mongoose")
const generator = require("generate-password")
const { ROLES, STATUS, TYPE_ACCOUNT } = require("../utils/enum")
const axios = require('axios')
const { generateAccessToken, generateRefreshToken } = require("../services/jwtService")
const SocialController = {


    LoginGoogle: async (req, res) => {
        try {
            let { accessToken } = req.body
            const response = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                { headers: { Authorization: `Bearer ${accessToken}` } },
            )
            const profile = response.data

            const existingUser = await User.findOne({ socialId: profile.sub })

            if (existingUser) {
                const data = {
                    sub: existingUser.username,
                    role: existingUser.role
                };
                const accessToken = generateAccessToken(data)
                const refreshToken = generateRefreshToken(data)
                const { password, ...doc } = existingUser._doc
                return res.status(200).json({
                    user: {
                        ...doc,
                        accessToken,
                        refreshToken
                    }
                });
            }
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash("12345678", salt);
            const newUser = await new User({
                id: profile.sub,
                email: profile.email,
                fullname: profile.family_name + ' ' + profile.given_name,
                birthday: new Date(),
                username: profile.sub,
                password: hash,
                status: STATUS.ACTIVE,
                type: TYPE_ACCOUNT.GOOGLE,
                socialId: profile.sub,
                avatar: profile.picture,
                role: ROLES.STUDENT
            })

            let error = newUser.validateSync();
            if (error)
                return res.status(400).json({
                    message: error.errors['email']?.message || error.errors['username']?.message
                })

            const user = await newUser.save();
            const data = {
                sub: user.username,
                role: user.role
            };
            accessToken = generateAccessToken(data)
            const refreshToken = generateRefreshToken(data)
            const { password, ...doc } = user._doc
            return res.status(200).json({
                user: {
                    ...doc,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.log(error)
            res.status(500).json({ username: "Lỗi tạo tài khoản" })
        }

    }


}

module.exports = { SocialController }