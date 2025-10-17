
function getBrightness(y) {
  const cy = 190; // center Y coordinate
  const verticalDistance = Math.abs(y - cy); // distance from center Y
  
  let brightness;
  if (verticalDistance <= 0) {
    brightness = 0;
  } else if (verticalDistance >= 120) {
    brightness = 100;
  } else {
    // Linear interpolation: distance from center Y determines brightness
    brightness = (verticalDistance / 120) * 100;
  }
  
  //console.log(`📍 Y Position: ${y}, center: ${cy}, distance: ${verticalDistance.toFixed(2)}, brightness: ${brightness.toFixed(2)}%`);
  return brightness;
}

function getAngleTheta(x, y) {
  // Define the pivot / origin
  const cx = 150;
  const cy = 190;

  // Compute vector from center to (x, y)
  const dx = x - cx;
  const dy = cy - y; // invert Y since canvas Y increases downward

  // Reference vector is straight up (0, 1)
  const refX = 0;
  const refY = 1;

  // Dot product and magnitudes
  const dot = dx * refX + dy * refY;
  const magA = Math.sqrt(dx * dx + dy * dy);
  const magB = Math.sqrt(refX * refX + refY * refY);

  // Get angle in radians and convert to degrees
  let theta = Math.acos(dot / (magA * magB)) * (180 / Math.PI);

  // Determine direction — left vs right of center
  // if point is to the left of the center, make it anticlockwise
  if (x < cx) {
    theta = -theta; // make left side negative for clarity (optional)
  }

  return Math.abs(theta); // always return positive degrees (0–180)
}

// Example tests (commented out for production)
//console.log(getAngleTheta(150, 70));   // 0 deg (straight up)
//console.log(getAngleTheta(300, 100));  // ~45 deg (right, clockwise)
//console.log(getAngleTheta(0, 100));    // ~45 deg (left, anticlockwise)

// Initialize Rive
const riveInstance = new rive.Rive({
  src: "ios_26_flashlight.riv",
  canvas: document.getElementById("riveCanvas"),
  artboard: "iOS 26 flashlight ",
  stateMachines: "flashlight",
  autoplay: true,
  autoBind: false,
  fit: rive.Fit.Contain,
  alignment: rive.Alignment.Center,
  onLoad: () => {
    console.log("✅ Rive loaded successfully");

    // Access view model
    const vm = riveInstance.viewModelByName("iOS 26 flashlight");
    if (!vm) {
      console.error("❌ ViewModel 'iOS 26 flashlight' not found");
      console.log("Available view models:", riveInstance.viewModelNames);
      return;
    }

    // Access instance
    const vmi = vm.instanceByName("my instance");
    if (!vmi) {
      console.error("❌ Instance 'my instance' not found");
      console.log("Available instances:", vm.instanceNames);
      return;
    }

    // Bind to the runtime
    riveInstance.bindViewModelInstance(vmi);

    // Get number properties
    const propX = vmi.number("x coordinate");
    const propY = vmi.number("y coordinate");
    const propAngleX = vmi.number("angle x");
    const propAngleY = vmi.number("angle y");
    const propBrightness = vmi.number("brightness");
    const propAngle = vmi.number("angle");

    
    // Get boolean property for flashlight switch
    const propSwitch = vmi.boolean("switch");

    if (!propX || !propY || !propBrightness || !propAngle) {
      console.error("❌ Could not access number properties (x-coordinate, y-coordinate, brightness, angle)");
      //console.log("Available number properties:", vmi.numberNames);
      return;
    }
    
    if (!propSwitch) {
      console.error("❌ Could not access boolean property 'switch'");
      //console.log("Available boolean properties:", vmi.booleanNames);
      return;
    }

    // Function to recompute brightness and angle based on position
    const recompute = () => {
      const x = propX.value;
      const y = propY.value;
      const angleX = propAngleX.value;
      const angleY = propAngleY.value;
      
      // Calculate brightness from Y coordinate
      const brightnessVal = getBrightness(y);
      propBrightness.value = brightnessVal;
      
      // Calculate angle from X,Y coordinates (clamp to max 60)
      const angleTheta = getAngleTheta(angleX, angleY);
      const clampedAngle = Math.min(angleTheta, 60); // Cap at 60, don't scale
      propAngle.value = clampedAngle;
      
      //console.log(`📊 Updated: brightness=${brightnessVal.toFixed(2)}%, angle=${clampedAngle.toFixed(2)} (theta=${angleTheta.toFixed(2)}°)`);
    };
    
    // Function to log switch state changes
    const logSwitchState = () => {
      const isOn = propSwitch.value;
      console.log(`💡 Flashlight: ${isOn ? 'ON' : 'OFF'}`);
    };

    // Subscribe to position changes (both X and Y affect angle)
    propX.on(() => recompute());
    propY.on(() => recompute());
    
    // Subscribe to switch changes
    propSwitch.on(() => logSwitchState());

    // Initial sync
    recompute();
    logSwitchState();

    console.log("✅ iOS 26 Flashlight data binding active (brightness + angle calculation)");
  },
  onError: (err) => {
    console.error("❌ Rive loading error:", err);
    console.log("Troubleshooting steps:");
    console.log("1. Check if 'ios_flashlight.riv' file exists in the same directory");
    console.log("2. Verify the artboard name is 'iOS flashlight'");
    console.log("3. Verify the state machine name is 'flashlight'");
    console.log("4. Check that the view model name is 'iOS flashlight'");
    console.log("5. Ensure the instance name is 'my instance'");
    console.log("6. Verify x-coordinate, y-coordinate, brightness, and angle properties exist in Rive");
  },
});