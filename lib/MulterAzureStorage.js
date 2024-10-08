"use strict";
// *********************************************************
//
// This file is subject to the terms and conditions defined in
// file 'LICENSE.txt', which is part of this source code package.
//
// *********************************************************
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterAzureStorage = exports.MASError = void 0;
// Node Modules
var uuid_1 = require("uuid");
var path_1 = require("path");
var storage_blob_1 = require("@azure/storage-blob");
var identity_1 = require("@azure/identity");
// Custom error class
var MASError = /** @class */ (function () {
    function MASError(message) {
        this.errorList = [];
        this.name = "Multer Azure Error";
        this.message = message ? message : null;
    }
    return MASError;
}());
exports.MASError = MASError;
var MulterAzureStorage = /** @class */ (function () {
    function MulterAzureStorage(options) {
        var _a;
        this.DEFAULT_UPLOAD_CONTAINER = "default-container";
        // Init error array
        var errorLength = 0;
        this._error = new MASError();
        //check to allow these values in environment file
        options.accessKey = (options.accessKey || process.env.AZURE_STORAGE_ACCESS_KEY || null);
        options.accountName = (options.accountName || process.env.AZURE_STORAGE_ACCOUNT || null);
        options.sasToken = (options.sasToken || process.env.AZURE_STORAGE_SAS_TOKEN || null);
        options.connectionString = (options.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || null);
        // Container name is required
        if (!options.containerName) {
            errorLength++;
            this._error.errorList.push(new Error("Missing required parameter: Azure container name."));
        }
        //If explicitly connection string auth, or no auth specified but a connection string was provided
        else if (options.authenticationType === 'connection string' || (!options.authenticationType && options.connectionString)) {
            if (!options.connectionString) {
                //if explicitly connection string, make sure the string was provided
                errorLength++;
                this._error.errorList.push(new Error("Missing required parameter for connection string auth: Azure blob storage connection string."));
            }
            else {
                this._blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(options.connectionString);
            }
        }
        //If this is not connection string auth then account name is required
        else if (!options.accountName) {
            errorLength++;
            this._error.errorList.push(new Error("Missing required parameter: Azure storage account name."));
        }
        //If explicitly AD auth
        else if (options.authenticationType === 'azure ad') {
            var credential = new identity_1.DefaultAzureCredential();
            this._blobServiceClient = new storage_blob_1.BlobServiceClient("https://".concat(options.accountName, ".blob.core.windows.net"), credential);
        }
        //If explicitly sas token auth, or no auth specified but a sas token was provided     
        else if (options.authenticationType === 'sas token' || (!options.authenticationType && options.sasToken)) {
            if (!options.sasToken) {
                //if explicitly SAS token, make sure the token was provided
                errorLength++;
                this._error.errorList.push(new Error("Missing required parameter for SAS token auth: SAS token value."));
            }
            else {
                this._blobServiceClient = new storage_blob_1.BlobServiceClient("https://".concat(options.accountName, ".blob.core.windows.net?").concat(options.sasToken));
            }
        }
        //If explicitly name/key auth, or no auth specified but name/key was provided.
        else if (options.authenticationType === 'account name and key' || (!options.authenticationType && options.accessKey)) {
            if (!options.accessKey) {
                //If explicitly name/key, check for key.
                errorLength++;
                this._error.errorList.push(new Error("Missing required parameter for account name/key auth: Azure blob storage access key."));
            }
            else {
                var sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(options.accountName, options.accessKey);
                this._blobServiceClient = new storage_blob_1.BlobServiceClient("https://".concat(options.accountName, ".blob.core.windows.net"), sharedKeyCredential);
            }
        }
        else {
            errorLength++;
            this._error.errorList.push(new Error("No authentication information found. Check options or environment file."));
        }
        // Vaidate errors before proceeding
        if (errorLength > 0) {
            var inflection = errorLength > 1 ? ["are", "s"] : ["is", ""];
            this._error.message = "There ".concat(inflection[0], " ").concat(errorLength, " missing required parameter").concat(inflection[1], ".");
            throw this._error;
        }
        // Set proper container name
        switch (typeof options.containerName) {
            case "string":
                this._containerName = this._promisifyStaticValue(options.containerName);
                break;
            case "function":
                this._containerName = options.containerName;
                break;
            default:
                // Catch for if container name is provided but not a desired type    
                this._containerName = this._promisifyStaticValue(this.DEFAULT_UPLOAD_CONTAINER);
                break;
        }
        // Check for metadata
        this._metadata = null;
        if (options.metadata) {
            switch (typeof options.metadata) {
                case "object":
                    this._metadata = this._promisifyStaticObj(options.metadata);
                    break;
                case "function":
                    this._metadata = options.metadata;
                    break;
            }
        }
        // Check for user defined properties
        this._contentSettings = null;
        if (options.contentSettings) {
            switch (typeof options.contentSettings) {
                case "object":
                    this._contentSettings = this._promisifyStaticObj(options.contentSettings);
                    break;
                case "function":
                    this._contentSettings = options.contentSettings;
                    break;
            }
        }
        // Set proper blob name
        this._blobName = (_a = options.blobName) !== null && _a !== void 0 ? _a : this._generateBlobName;
    }
    //fulfill Multer contract 
    MulterAzureStorage.prototype._handleFile = function (req, file, callback) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var blobName, containerName, containerClient, blockBlobClient, contentSettings, uploadOptions, _b, blobProperties, intermediateFile, finalFile, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(this._error.errorList.length > 0)) return [3 /*break*/, 1];
                        callback(this._error, null);
                        return [3 /*break*/, 13];
                    case 1:
                        _c.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, this._blobName(req, file)];
                    case 2:
                        blobName = _c.sent();
                        return [4 /*yield*/, this._containerName(req, file)];
                    case 3:
                        containerName = _c.sent();
                        containerClient = this._blobServiceClient.getContainerClient(containerName);
                        // Create container if it doesnt exist
                        return [4 /*yield*/, this._createContainerIfNotExists(containerName)];
                    case 4:
                        // Create container if it doesnt exist
                        _c.sent();
                        blockBlobClient = containerClient.getBlockBlobClient(blobName);
                        contentSettings = void 0;
                        if (!(this._contentSettings == null)) return [3 /*break*/, 5];
                        contentSettings = {
                            contentType: file.mimetype,
                            contentDisposition: 'inline'
                        };
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this._contentSettings(req, file)];
                    case 6:
                        contentSettings = (_c.sent());
                        _c.label = 7;
                    case 7:
                        uploadOptions = {
                            blobHTTPHeaders: { blobContentType: contentSettings.contentType, blobContentDisposition: contentSettings.contentDisposition },
                        };
                        if (!this._metadata) return [3 /*break*/, 9];
                        _b = uploadOptions;
                        return [4 /*yield*/, this._metadata(req, file)];
                    case 8:
                        _b.metadata = (_c.sent());
                        _c.label = 9;
                    case 9: return [4 /*yield*/, blockBlobClient.uploadStream(file.stream, file.stream.readableHighWaterMark, 5, uploadOptions)];
                    case 10:
                        _c.sent();
                        return [4 /*yield*/, blockBlobClient.getProperties()];
                    case 11:
                        blobProperties = _c.sent();
                        intermediateFile = {
                            url: blockBlobClient.url,
                            blobName: blockBlobClient.name,
                            etag: blobProperties.etag,
                            blobType: blobProperties.blobType,
                            metadata: blobProperties.metadata,
                            container: blockBlobClient.containerName,
                            blobSize: (_a = blobProperties.contentLength) === null || _a === void 0 ? void 0 : _a.toString()
                        };
                        finalFile = Object.assign({}, file, intermediateFile);
                        callback(null, finalFile);
                        return [3 /*break*/, 13];
                    case 12:
                        err_1 = _c.sent();
                        callback(err_1, null);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    //fulfill Multer contract 
    MulterAzureStorage.prototype._removeFile = function (req, file, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var containerName, containerClient, exists, blobName, rFError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._error.errorList.length > 0)) return [3 /*break*/, 1];
                        callback(this._error);
                        return [3 /*break*/, 9];
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, this._containerName(req, file)];
                    case 2:
                        containerName = _a.sent();
                        containerClient = this._blobServiceClient.getContainerClient(containerName);
                        return [4 /*yield*/, containerClient.exists()];
                    case 3:
                        exists = _a.sent();
                        if (!!exists) return [3 /*break*/, 4];
                        this._error.message = "Container ".concat(containerName, " does not exist on this account. Check options.");
                        callback(this._error);
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this._blobName(req, file)];
                    case 5:
                        blobName = _a.sent();
                        return [4 /*yield*/, containerClient.deleteBlob(blobName)];
                    case 6:
                        _a.sent();
                        callback(null);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        rFError_1 = _a.sent();
                        callback(rFError_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /** Helpers */
    MulterAzureStorage.prototype._createContainerIfNotExists = function (name) {
        var containerClient = this._blobServiceClient.getContainerClient(name);
        var options = {};
        if (this._containerAccessLevel !== 'private') {
            //For private containers, do not pass the access header
            options.access = this._containerAccessLevel;
        }
        return containerClient.createIfNotExists(options);
    };
    MulterAzureStorage.prototype._generateBlobName = function (_req, file) {
        return new Promise(function (resolve, _reject) {
            resolve("".concat(Date.now(), "-").concat((0, uuid_1.v4)()).concat((0, path_1.extname)(file.originalname)));
        });
    };
    MulterAzureStorage.prototype._promisifyStaticValue = function (value) {
        return function (_req, _file) {
            return new Promise(function (resolve, _reject) {
                resolve(value);
            });
        };
    };
    MulterAzureStorage.prototype._promisifyStaticObj = function (value) {
        return function (_req, _file) {
            return new Promise(function (resolve, _reject) {
                resolve(value);
            });
        };
    };
    return MulterAzureStorage;
}());
exports.MulterAzureStorage = MulterAzureStorage;
exports.default = MulterAzureStorage;
//# sourceMappingURL=MulterAzureStorage.js.map