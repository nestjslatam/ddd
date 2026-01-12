import { MetaRequestContextService } from './meta-context-request.service';
import { RequestContext } from 'nestjs-request-context';

jest.mock('nestjs-request-context');

describe('MetaRequestContextService', () => {
    const mockContext = {
        req: {
            trackingId: 'initial-tracking',
            requestId: 'initial-request',
            user: 'initial-user',
        },
    };

    beforeEach(() => {
        // Mock the static getter for currentContext
        // Since we mocked the module, RequestContext is now a mock object
        // But RequestContext is a class, so we need to ensure the static property behaves as we want.
        // However, jest.mock auto-mocks classes. Static properties might need explicit defining if they are getters.

        // A more reliable way when mocking the module is to define the implementation:
        Object.defineProperty(RequestContext, 'currentContext', {
            get: jest.fn(() => mockContext),
            configurable: true
        });
    });

    it('should get context', () => {
        expect(MetaRequestContextService.getContext()).toBe(mockContext.req);
    });

    it('should set and get trackingId', () => {
        MetaRequestContextService.setTrackingId('new-tracking');
        // Since we are operating on the mockContext reference we returned, check that.
        expect(mockContext.req.trackingId).toBe('new-tracking');
        expect(MetaRequestContextService.getTrackingId()).toBe('new-tracking');
    });

    it('should set and get requestId', () => {
        MetaRequestContextService.setRequestId('new-request');
        expect(mockContext.req.requestId).toBe('new-request');
        expect(MetaRequestContextService.getRequestId()).toBe('new-request');
    });

    it('should throw if setting empty requestId', () => {
        expect(() => MetaRequestContextService.setRequestId('')).toThrow('RequestId is required.');
    });

    it('should set and get user', () => {
        MetaRequestContextService.setUser('new-user');
        expect(mockContext.req.user).toBe('new-user');
        expect(MetaRequestContextService.getUser()).toBe('new-user');
    });

    it('should throw if setting empty user', () => {
        expect(() => MetaRequestContextService.setUser('')).toThrow('User data is required.');
    });
});
