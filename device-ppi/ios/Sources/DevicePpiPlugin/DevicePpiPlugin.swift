import Foundation
import Capacitor
import UIKit

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(DevicePpiPlugin)
public class DevicePpiPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DevicePpiPlugin"
    public let jsName = "DevicePpi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = DevicePpi()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func getPPI(_ call: CAPPluginCall) {
        let scale = UIScreen.main.scale
        var ppi: CGFloat = 160.0 * scale // Fallback default

        if UIDevice.current.userInterfaceIdiom == .phone {
            ppi = 163.0 * scale
        } else if UIDevice.current.userInterfaceIdiom == .pad {
            ppi = 132.0 * scale
        }

        call.resolve([
            "ppi": ppi,
            "scale": scale
        ])
    }
}
