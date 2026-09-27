import React, { useState } from 'react';
import { Camera, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { diagnosePlantImage } from '../../../api/diagnosis';
import './farmerDiagnosis.css';

const severityClass = (severity) => `fd-severity fd-severity-${severity ?? 'unknown'}`;

const FarmerDiagnosis = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setError('');
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const diagnosis = await diagnosePlantImage(file);
            setResult(diagnosis);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not analyze the image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fd-page">
            <h2 className="fd-title">Plant Doctor</h2>
            <p className="fd-subtitle">
                Upload a photo of a sick or suspicious plant and get an instant AI diagnosis
                with a recommended next step.
            </p>

            <div className="fd-card">
                <label htmlFor="fd-upload" className="fd-upload-zone">
                    {preview ? (
                        <img src={preview} alt="Selected plant" className="fd-preview-image" />
                    ) : (
                        <>
                            <Camera size={32} />
                            <span>Choose a photo of the affected plant</span>
                        </>
                    )}
                </label>
                <input
                    id="fd-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="fd-upload-input"
                />

                <button type="button" className="fd-analyze-btn" onClick={handleAnalyze} disabled={!file || loading}>
                    {loading ? <><Loader2 size={18} className="fd-spin" /> Analyzing…</> : 'Analyze Photo'}
                </button>

                {error && <p className="auth__error-message">{error}</p>}

                {result && (
                    <div className="fd-result">
                        <div className="fd-result-header">
                            {result.issue === 'healthy' ? (
                                <CheckCircle2 size={22} className="fd-icon-healthy" />
                            ) : (
                                <AlertTriangle size={22} className="fd-icon-warning" />
                            )}
                            <div>
                                <h3 className="fd-result-issue">{result.issue}</h3>
                                <p className="fd-result-crop">Crop: {result.crop}</p>
                            </div>
                            <span className={severityClass(result.severity)}>{result.severity}</span>
                        </div>
                        <p className="fd-result-description">{result.description}</p>
                        <div className="fd-result-recommendation">
                            <strong>Recommendation:</strong> {result.recommendation}
                        </div>
                        {typeof result.confidence === 'number' && (
                            <p className="fd-confidence">Confidence: {Math.round(result.confidence * 100)}%</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerDiagnosis;
