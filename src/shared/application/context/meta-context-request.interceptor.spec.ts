import { MetaRequestContextInterceptor } from './meta-context-request.interceptor';
import { MetaRequestContextService } from './meta-context-request.service';
import { MetaRequestHelper } from './meta-request.helper';
import { of } from 'rxjs';

// Mock dependencies
jest.mock('./meta-context-request.service');
jest.mock('./meta-request.helper');

describe('MetaRequestContextInterceptor', () => {
    let interceptor: MetaRequestContextInterceptor;

    beforeEach(() => {
        interceptor = new MetaRequestContextInterceptor();
        jest.clearAllMocks();
    });

    it('should intercept and set context', (done) => {
        const mockContext = {} as any;
        const mockHandler = {
            handle: jest.fn().mockReturnValue(of('response')),
        };

        (MetaRequestHelper.getMetadata as jest.Mock).mockReturnValue({
            requestId: 'req-1',
            trackingId: 'track-1',
            user: 'user-1',
        });

        interceptor.intercept(mockContext, mockHandler).subscribe((res) => {
            expect(res).toBe('response');
            expect(MetaRequestContextService.setRequestId).toHaveBeenCalled(); // Called twice likely
            expect(MetaRequestContextService.setTrackingId).toHaveBeenCalledWith('track-1');
            expect(MetaRequestContextService.setUser).toHaveBeenCalledWith('user-1');
            done();
        });
    });
});
