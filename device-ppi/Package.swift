// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DevicePpi",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "DevicePpi",
            targets: ["DevicePpiPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "DevicePpiPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/DevicePpiPlugin"),
        .testTarget(
            name: "DevicePpiPluginTests",
            dependencies: ["DevicePpiPlugin"],
            path: "ios/Tests/DevicePpiPluginTests")
    ]
)