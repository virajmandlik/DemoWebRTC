// Media Diagnostic Component for troubleshooting camera/microphone issues
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiCamera, 
  FiMic, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw,
  FiInfo,
  FiSettings,
  FiMonitor,
  FiWifi
} from 'react-icons/fi';

const DiagnosticContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 20px auto;
`;

const Title = styled.h2`
  color: #333;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #2196F3;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background: ${props => {
    if (props.status === 'success') return '#f8fff8';
    if (props.status === 'error') return '#fff8f8';
    if (props.status === 'warning') return '#fffbf0';
    return '#f8f9fa';
  }};
  border-left: 4px solid ${props => {
    if (props.status === 'success') return '#4CAF50';
    if (props.status === 'error') return '#f44336';
    if (props.status === 'warning') return '#FF9800';
    return '#e0e0e0';
  }};
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  color: #666;
  font-size: 14px;
`;

const StatusValue = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  color: ${props => {
    if (props.status === 'success') return '#4CAF50';
    if (props.status === 'error') return '#f44336';
    if (props.status === 'warning') return '#FF9800';
    return '#666';
  }};
`;

const DeviceList = styled.div`
  margin-top: 10px;
`;

const DeviceItem = styled.div`
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 5px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SuggestionList = styled.div`
  margin-top: 15px;
`;

const Suggestion = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid ${props => {
    if (props.type === 'critical') return '#f44336';
    if (props.type === 'warning') return '#FF9800';
    if (props.type === 'error') return '#f44336';
    return '#2196F3';
  }};
`;

const SuggestionIcon = styled.div`
  color: ${props => {
    if (props.type === 'critical') return '#f44336';
    if (props.type === 'warning') return '#FF9800';
    if (props.type === 'error') return '#f44336';
    return '#2196F3';
  }};
  margin-top: 2px;
`;

const SuggestionContent = styled.div`
  flex: 1;
  
  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }
  
  .action {
    color: #666;
    font-size: 14px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #2196F3;
  color: white;
  
  &:hover:not(:disabled) {
    background: #1976D2;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover:not(:disabled) {
    background: #e0e0e0;
  }
`;

const TestResult = styled.div`
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
  background: ${props => props.success ? '#f8fff8' : '#fff8f8'};
  border: 1px solid ${props => props.success ? '#4CAF50' : '#f44336'};
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'success':
      return <FiCheckCircle />;
    case 'error':
      return <FiXCircle />;
    case 'warning':
      return <FiAlertTriangle />;
    default:
      return <FiInfo />;
  }
};

const getSuggestionIcon = (type) => {
  switch (type) {
    case 'critical':
      return <FiXCircle />;
    case 'error':
      return <FiXCircle />;
    case 'warning':
      return <FiAlertTriangle />;
    default:
      return <FiInfo />;
  }
};

const MediaDiagnostic = ({ 
  diagnosticInfo, 
  devices, 
  permissions, 
  error,
  onTest,
  onRetry,
  onRefreshDevices,
  isLoading 
}) => {
  const [testResult, setTestResult] = useState(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const handleTest = async () => {
    setIsTestLoading(true);
    setTestResult(null);
    
    try {
      const result = await onTest();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsTestLoading(false);
    }
  };

  const getBrowserCompatibilityStatus = () => {
    if (!diagnosticInfo) return 'unknown';
    
    if (!diagnosticInfo.isSupported) return 'error';
    if (!diagnosticInfo.isSecureContext) return 'error';
    return 'success';
  };

  const getDeviceStatus = () => {
    const hasVideo = devices.videoInputs.length > 0;
    const hasAudio = devices.audioInputs.length > 0;
    
    if (!hasVideo && !hasAudio) return 'error';
    if (!hasVideo || !hasAudio) return 'warning';
    return 'success';
  };

  const getPermissionStatus = () => {
    if (permissions.camera === 'denied' || permissions.microphone === 'denied') return 'error';
    if (permissions.camera === 'granted' && permissions.microphone === 'granted') return 'success';
    return 'warning';
  };

  const generateSuggestions = () => {
    const suggestions = [];

    if (!diagnosticInfo?.isSecureContext) {
      suggestions.push({
        type: 'critical',
        title: 'Insecure Connection',
        action: 'Access the site via HTTPS or localhost. Camera/microphone requires a secure connection.'
      });
    }

    if (!diagnosticInfo?.isSupported) {
      suggestions.push({
        type: 'critical',
        title: 'Browser Not Supported',
        action: 'Use a modern browser like Chrome, Firefox, Safari, or Edge.'
      });
    }

    if (devices.videoInputs.length === 0) {
      suggestions.push({
        type: 'warning',
        title: 'No Camera Detected',
        action: 'Connect a camera to your device and refresh the page.'
      });
    }

    if (devices.audioInputs.length === 0) {
      suggestions.push({
        type: 'warning',
        title: 'No Microphone Detected',
        action: 'Connect a microphone to your device and refresh the page.'
      });
    }

    if (permissions.camera === 'denied') {
      suggestions.push({
        type: 'error',
        title: 'Camera Permission Denied',
        action: 'Click the camera icon in your browser\'s address bar and allow camera access.'
      });
    }

    if (permissions.microphone === 'denied') {
      suggestions.push({
        type: 'error',
        title: 'Microphone Permission Denied',
        action: 'Click the microphone icon in your browser\'s address bar and allow microphone access.'
      });
    }

    if (error && error.includes('NotReadableError')) {
      suggestions.push({
        type: 'warning',
        title: 'Device In Use',
        action: 'Close other applications that might be using your camera or microphone.'
      });
    }

    // Always add general suggestions
    suggestions.push({
      type: 'info',
      title: 'General Troubleshooting',
      action: 'Try refreshing the page, restarting your browser, or using Chrome for best compatibility.'
    });

    return suggestions;
  };

  return (
    <DiagnosticContainer>
      <Title>
        <FiSettings />
        Media Diagnostic
      </Title>

      {/* Browser Compatibility */}
      <Section status={getBrowserCompatibilityStatus()}>
        <SectionTitle>
          <FiMonitor />
          Browser Compatibility
        </SectionTitle>
        <StatusItem>
          <StatusLabel>getUserMedia Support</StatusLabel>
          <StatusValue status={diagnosticInfo?.isSupported ? 'success' : 'error'}>
            {getStatusIcon(diagnosticInfo?.isSupported ? 'success' : 'error')}
            {diagnosticInfo?.isSupported ? 'Supported' : 'Not Supported'}
          </StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Secure Context (HTTPS/localhost)</StatusLabel>
          <StatusValue status={diagnosticInfo?.isSecureContext ? 'success' : 'error'}>
            {getStatusIcon(diagnosticInfo?.isSecureContext ? 'success' : 'error')}
            {diagnosticInfo?.isSecureContext ? 'Secure' : 'Insecure'}
          </StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Current URL</StatusLabel>
          <StatusValue>
            {window.location.protocol}//{window.location.host}
          </StatusValue>
        </StatusItem>
      </Section>

      {/* Device Detection */}
      <Section status={getDeviceStatus()}>
        <SectionTitle>
          <FiCamera />
          Available Devices
        </SectionTitle>
        <StatusItem>
          <StatusLabel>Video Devices</StatusLabel>
          <StatusValue status={devices.videoInputs.length > 0 ? 'success' : 'error'}>
            {getStatusIcon(devices.videoInputs.length > 0 ? 'success' : 'error')}
            {devices.videoInputs.length} found
          </StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Audio Devices</StatusLabel>
          <StatusValue status={devices.audioInputs.length > 0 ? 'success' : 'error'}>
            {getStatusIcon(devices.audioInputs.length > 0 ? 'success' : 'error')}
            {devices.audioInputs.length} found
          </StatusValue>
        </StatusItem>
        
        {devices.videoInputs.length > 0 && (
          <DeviceList>
            <strong>Video Devices:</strong>
            {devices.videoInputs.map((device, index) => (
              <DeviceItem key={device.deviceId}>
                📹 {device.label || `Camera ${index + 1}`}
              </DeviceItem>
            ))}
          </DeviceList>
        )}
        
        {devices.audioInputs.length > 0 && (
          <DeviceList>
            <strong>Audio Devices:</strong>
            {devices.audioInputs.map((device, index) => (
              <DeviceItem key={device.deviceId}>
                🎤 {device.label || `Microphone ${index + 1}`}
              </DeviceItem>
            ))}
          </DeviceList>
        )}
      </Section>

      {/* Permissions */}
      <Section status={getPermissionStatus()}>
        <SectionTitle>
          <FiWifi />
          Permissions
        </SectionTitle>
        <StatusItem>
          <StatusLabel>Camera Permission</StatusLabel>
          <StatusValue status={permissions.camera === 'granted' ? 'success' : permissions.camera === 'denied' ? 'error' : 'warning'}>
            {getStatusIcon(permissions.camera === 'granted' ? 'success' : permissions.camera === 'denied' ? 'error' : 'warning')}
            {permissions.camera}
          </StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Microphone Permission</StatusLabel>
          <StatusValue status={permissions.microphone === 'granted' ? 'success' : permissions.microphone === 'denied' ? 'error' : 'warning'}>
            {getStatusIcon(permissions.microphone === 'granted' ? 'success' : permissions.microphone === 'denied' ? 'error' : 'warning')}
            {permissions.microphone}
          </StatusValue>
        </StatusItem>
      </Section>

      {/* Error Information */}
      {error && (
        <Section status="error">
          <SectionTitle>
            <FiXCircle />
            Current Error
          </SectionTitle>
          <div style={{ color: '#f44336', fontSize: '14px', lineHeight: '1.5' }}>
            {error}
          </div>
        </Section>
      )}

      {/* Suggestions */}
      <Section>
        <SectionTitle>
          <FiInfo />
          Troubleshooting Suggestions
        </SectionTitle>
        <SuggestionList>
          {generateSuggestions().map((suggestion, index) => (
            <Suggestion key={index} type={suggestion.type}>
              <SuggestionIcon type={suggestion.type}>
                {getSuggestionIcon(suggestion.type)}
              </SuggestionIcon>
              <SuggestionContent>
                <div className="title">{suggestion.title}</div>
                <div className="action">{suggestion.action}</div>
              </SuggestionContent>
            </Suggestion>
          ))}
        </SuggestionList>
      </Section>

      {/* Test Result */}
      {testResult && (
        <TestResult success={testResult.success}>
          <strong>{testResult.success ? '✅ Test Passed' : '❌ Test Failed'}</strong>
          {testResult.error && (
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              {testResult.error}
            </div>
          )}
          {testResult.result && (
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              Video tracks: {testResult.result.videoTracks}, 
              Audio tracks: {testResult.result.audioTracks}
            </div>
          )}
        </TestResult>
      )}

      {/* Action Buttons */}
      <ButtonGroup>
        <PrimaryButton onClick={handleTest} disabled={isTestLoading}>
          {isTestLoading ? <FiRefreshCw className="spinning" /> : <FiCamera />}
          {isTestLoading ? 'Testing...' : 'Test Camera/Mic'}
        </PrimaryButton>
        
        <SecondaryButton onClick={onRefreshDevices} disabled={isLoading}>
          <FiRefreshCw />
          Refresh Devices
        </SecondaryButton>
        
        {onRetry && (
          <SecondaryButton onClick={onRetry} disabled={isLoading}>
            <FiRefreshCw />
            Retry Connection
          </SecondaryButton>
        )}
      </ButtonGroup>
    </DiagnosticContainer>
  );
};

export default MediaDiagnostic;