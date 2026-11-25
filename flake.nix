{
  description = "NatvieLMS (Expo + SQLite + Drizzle)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        # Versiones de node_modules/react-native/gradle/libs.versions.toml
        android = pkgs.androidenv.composeAndroidPackages {
          platformVersions = [
            "36"
            "37.0"
          ];
          buildToolsVersions = [
            "36.0.0"
            "37.0.0"
          ];
          includeNDK = true;
          ndkVersions = [ "27.1.12297006" ];
          includeCmake = true;
          cmakeVersions = [ "3.22.1" ];
          # AVD tablet_api36
          includeEmulator = true;
          includeSystemImages = true;
          systemImageTypes = [ "google_apis" ];
          abiVersions = [ "x86_64" ];
        };
        sdk = "${android.androidsdk}/libexec/android-sdk";
        jdk = pkgs.jdk17;
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            pnpm
            git
            android.androidsdk
            android.platform-tools
            jdk
          ];

          JAVA_HOME = jdk.home;
          ANDROID_HOME = sdk;
          ANDROID_SDK_ROOT = sdk;
          # El aapt2 que Gradle baja de Maven no corre en NixOS.
          GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${sdk}/build-tools/37.0.0/aapt2";
        };
      }
    );
}
