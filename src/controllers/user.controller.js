import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log("REQ.FILES =", req.files);
  console.log("REQ.FILE =", req.file);

  const { fullname, email, username, password } = req.body;
  console.log("email:", email);

  // 🔹 basic validation
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 🔹 check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // 🔹 files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 🔹 upload avatar (mandatory)
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed (Cloudinary)");
  }

  // 🔹 upload cover image ONLY if provided
  let coverImageUrl = "";
  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    coverImageUrl = coverImage?.secure_url || "";
  }

  // 🔹 create user
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.secure_url,
    coverImage: coverImageUrl,
  });

  // 🔹 remove sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
