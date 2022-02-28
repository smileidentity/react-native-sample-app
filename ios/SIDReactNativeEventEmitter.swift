//
//  SIDReactNativeEventEmitter.swift
//  RnSmileId
//
//  Created by Japhet Ndhlovu on 2021/06/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
@objc(SIDReactNativeEventEmitter)
open class SIDReactNativeEventEmitter: RCTEventEmitter {
    
    override init() {
        super.init()
        SIDEventEmitter.sharedInstance.registerEventEmitter(eventEmitter: self)
    }
    
    /// Base overide for RCTEventEmitter.
    ///
    /// - Returns: all supported events
    @objc open override func supportedEvents() -> [String] {
        return SIDEventEmitter.sharedInstance.allEvents
    }

}

