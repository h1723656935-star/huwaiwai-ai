"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0812',
          color: '#ECE7FF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            textAlign: 'center',
            background: 'rgba(26,22,40,0.9)',
            borderRadius: '16px',
            padding: '32px 24px',
            border: '1px solid rgba(120,101,248,0.2)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#FF6B7A' }}>
              页面加载出错
            </h2>
            <p style={{ fontSize: '14px', color: '#C7B8FF', marginBottom: '16px', lineHeight: 1.6 }}>
              你的浏览器可能版本过旧，或存在兼容性问题。
            </p>
            {this.state.error && (
              <div style={{
                fontSize: '12px',
                color: '#FF7878',
                background: 'rgba(255,77,79,0.1)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'left',
                wordBreak: 'break-word',
                marginBottom: '16px',
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7865F8, #A991FF)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                刷新页面
              </button>
              <a
                href="/"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(120,101,248,0.3)',
                  background: 'transparent',
                  color: '#C7B8FF',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                返回首页
              </a>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(199,184,255,0.4)', marginTop: '16px' }}>
              建议更新 Safari 到最新版本，或使用 Chrome 浏览器访问
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
