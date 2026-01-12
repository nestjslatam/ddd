import { ExecutionContext } from '@nestjs/common';
import { MetaRequestHelper } from './meta-request.helper';
import { GqlExecutionContext } from '@nestjs/graphql';

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
    GqlExecutionContext: {
        create: jest.fn(),
    },
}));

describe('MetaRequestHelper', () => {
    describe('getMetadata', () => {
        it('should extract metadata from HTTP context', () => {
            const mockRequest = {
                body: {
                    trackingId: 'track-123',
                    requestId: 'req-123',
                    user: 'user-123',
                },
            };

            const mockExecutionContext = {
                getType: jest.fn().mockReturnValue('http'),
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue(mockRequest),
                }),
            } as any as ExecutionContext;

            const metadata = MetaRequestHelper.getMetadata(mockExecutionContext);

            expect(metadata).toEqual({
                trackingId: 'track-123',
                requestId: 'req-123',
                user: 'user-123',
            });
        });

        it('should generate default metadata for HTTP if missing in body', () => {
            const mockRequest = {
                body: {},
            };

            const mockExecutionContext = {
                getType: jest.fn().mockReturnValue('http'),
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue(mockRequest),
                }),
            } as any as ExecutionContext;

            const metadata = MetaRequestHelper.getMetadata(mockExecutionContext);

            expect(metadata.trackingId).toBe('');
            expect(metadata.user).toBe('admin');
            expect(metadata.requestId).toBeDefined(); // uuidv4
        });

        // Note: GraphQL tests can be added here mirroring the logic. 
        // For coverage, just covering the 'http' branch and the 'default' branch (if fallback logic is reachable) 
        // The fallback logic at the end of the file seems reachable if context type is neither http nor graphql, 
        // OR if graphql logic falls through.

        it('should fallback to default metadata generation for unknown context type', () => {
            const mockExecutionContext = {
                getType: jest.fn().mockReturnValue('rpc'),
            } as any as ExecutionContext;

            const metadata = MetaRequestHelper.getMetadata(mockExecutionContext);

            expect(metadata.requestId).toBeDefined();
            expect(metadata.trackingId).toBeDefined();
            expect(metadata.user).toBe('');
        });
    });
});
