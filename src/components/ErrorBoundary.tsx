import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View className="flex-1 items-center justify-center bg-background p-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">
              The app ran into an unexpected error. Try again or restart the
              app.
            </Text>
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-primary-foreground font-medium">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )
      );
    }

    return this.props.children;
  }
}
