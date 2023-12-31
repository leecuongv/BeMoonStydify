const Test = require("../models/Test")
const mongoose = require("mongoose");
const User = require("../models/User")
const TakeTest = require("../models/TakeTest");
const { STATUS, VIEWPOINT, ROLES } = require("../utils/enum");
const moment = require("moment/moment");
const { response } = require("express");

const AdminController = {


    updateStatus: async (req, res) => {
        try {

            const { userId, status } = req.body;
            const updateUser = await User.findByIdAndUpdate(userId, { status: status }, { new: true })

            if (updateUser)
                return res.status(200).json(updateUser)
            return res.status(400).json({ message: "Kích hoạt tài khoản thất bại" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi kích hoạt tài khoản" })
        }
    },

    updateUserRole: async (req, res) => {
        try {

            const { username, role } = req.body;

            if (username) {
                const newUser = await User.updateOne({ username }, { role: role }, { new: true })
                if (newUser)
                    return res.status(200).json({ message: "Cập nhật quyền thành công" })

                else
                    return res.status(400).json({ message: "Cập nhật không thành công" })
            } else
                return res.status(400).json({ message: "Không có username" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi cập nhật quyền tài khoản" })
        }
    },

    deleteUserById: async (req, res) => {
        try {

            const { id } = req.query;
            const user = await User.findById(id)
            if (!user)
                return res.status(400).json({
                    message: "Không tìn thấy người dùng!"
                })
            let name = user.fullname
            let deleteUser = User.findByIdAndDelete(id)
            if (deleteUser)
                return res.status(200).json({
                    message: "Xóa người dùng " + name + " thành công!"
                })
            return res.status(200).json({
                message: "Xóa người dùng " + name + " thất bại!"
            })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi xóa người dùng" })
        }
    },

    GetListUser: (req, res) => {
        try {

            User.find().sort({ fullname: -1 })
                .then(result => {
                    res.status(200).json(result)
                }).
                catch(err => {
                    console.log(err)
                    res.status(400).json({ message: "Lỗi lấy danh sách người dùng!" })
                })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi lấy danh sách người dùng" })
        }
    },


}

module.exports = { AdminController }