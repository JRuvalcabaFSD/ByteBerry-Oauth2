# [1.1.0](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/compare/v1.0.0...v1.1.0) (2026-01-07)


### Features

* **auth:** implement login use case with DTOs, validation schemas, and controller integration ([d09774e](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/d09774e2b44de90d886ea66cc758c2468b1af666)), closes [#10](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/10)
* **ci:** add JWT key generation step to CI workflows and improve health service checks ([b35d6d1](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b35d6d182794155f76766b0f468a40f86b016979)), closes [#17](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/17) [#18](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/18)
* **client:** implement client validation use case, DTOs, and in-memory repository ([8198e6a](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/8198e6a6a838fa56daed61a3a48b38293119d583))
* **docker:** update Dockerfile to include public and views directories, and enhance entrypoint script ([2bbbcf4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/2bbbcf4ab48b7c951b78cf34100aa1526269aca0))
* **health:** integrate JWKS service into health checks and enhance logging ([7fb5862](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/7fb58625e04cd726c9027c4f1202f2fa317f82dc)), closes [#16](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/16)
* Implement OAuth2 authorization code flow with PKCE support ([3dfe995](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3dfe995ea3f7cb727ad4dc7f12fe6a9b5a64cf18)), closes [#11](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/11)
* implement OAuth2 authorization code management with value objects and in-memory repository ([eb83eed](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/eb83eed989b5e7ff75b4c1ab35fc15f38123e398)), closes [#9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/9)
* implement user entity and repository with in-memory mock data ([79b7ea3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/79b7ea34d836ae68e24b3b2419b19a9d1d304a16))
* **jwks:** Implement JWKS service, use case, and controller for JWT verification ([249ab94](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/249ab9425e8fc97abe61f3ed3400944736907367)), closes [#13](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/13)
* **login:** implement login functionality with controller and routes, add login view and styles ([0c7f001](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/0c7f001447cf9288af4769139bcf2b35737983e4))
* **oauth:** Implement OAuth2 Token Exchange and PKCE Verification ([cd43b07](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/cd43b07a0adf6e83747dd25f02327f59bc37629f)), closes [#12](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/12)
* **session:** add session management with in-memory repository and configuration updates ([03c659b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/03c659bd636a712d5240cdc8ff1427c3d7007909))
* **tests:** add unit tests for JWKS and JWT services, use cases, and PKCE verifier ([bb226fb](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/bb226fb1f6adcb15111a431dedc419aae9c9f024))

# 1.0.0 (2026-01-02)


### Bug Fixes

* **deps:** update tmp package version to ensure compatibility ([e261b6c](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/e261b6cc404c00a15ebc4429f413b15dfecc00c8))


### Features

* **bootstrap:** implement bootstrap process with graceful shutdown and error handling ([f55bc12](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/f55bc121fc7e79754aab4420fccdc5cf4358f4d8))
* **ci-cd:** add pull request template and CI workflow configuration ([6db241e](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/6db241e5ac9bc09363522f75581be0dfdec25d76)), closes [#6](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/6)
* **ci:** add release and sync workflows for automated versioning and branch synchronization ([873413d](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/873413d6fe338e1ce93b745775df77c292c0436a)), closes [#7](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/7) [#8](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/8)
* **config:** implement configuration management and error handling; add environment variables setup ([2eec5b5](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/2eec5b5272f74b6941e503580180c8ba29c30409)), closes [#1](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/1)
* **container:** implement dependency injection container with service registration and resolution ([22aeecc](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/22aeecce7e22f4cc48295c58f964cb9b0973593a)), closes [#2](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/2)
* **docker:** add multi-stage Dockerfile and build scripts for multi-arch support ([1397a7c](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/1397a7ca9b17e15db841b42149d0a6becc39b416)), closes [#4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/4)
* **errors:** implement centralized error handling with detailed logging ([de59813](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/de59813ec9fdd95b626e573fa97d484c0e86c8cb))
* Implement HTTP server with Express and middleware for logging, error handling, and security ([b0369d3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b0369d3635a0cfc467edb0a2578fc2c5eba6fc67)), closes [#3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/3)
* Implement UUID service with generation and validation methods ([9a77bdf](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/9a77bdf09440a5e5612cb6cecc668c0e1c1af878))
* initialize project with TypeScript configuration and Vitest setup ([88514e6](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/88514e6478257752882eab41c217fbea6ba45a82))
* **logging:** implement Winston logger service with structured logging and rotation ([6c52ed8](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/6c52ed802b744b98350fc96acb88ed6b06ea5833))
* **tests:** add global setup for integration tests and Vitest globals import ([03953ff](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/03953ff8043bbefaa9aa844ee7b8635f957b3b1b))
