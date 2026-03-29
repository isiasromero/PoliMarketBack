import { HttpException, HttpStatus } from '@nestjs/common';
import { Result } from '../../shared/domain/result';

/**
 * Unwraps a {@link Result}<T> for HTTP responses.
 *
 * If the result represents a successful operation, returns the inner value.
 * If it represents a failure, throws an {@link HttpException} with the error
 * message and a `400 Bad Request` status code.
 *
 * @typeParam T - The type of the success value contained in the Result.
 * @param result - The Result object to unwrap.
 * @param successStatus - HTTP status code to associate with a successful
 *   outcome. Defaults to {@link HttpStatus.OK} (200). While not returned
 *   directly, callers may use it for additional response shaping.
 * @returns The unwrapped success value of type T.
 * @throws {HttpException} When the result indicates failure.
 *
 * @example
 * ```typescript
 * const result = await someUseCase.execute(dto);
 * const value = unwrapResult(result);
 * // value is now the success payload, or an HttpException was thrown.
 * ```
 */
export function unwrapResult<T>(
  result: Result<T>,
  successStatus: number = HttpStatus.OK,
): T {
  if (result.success) {
    return result.value;
  }

  throw new HttpException(
    { success: false, error: result.error },
    HttpStatus.BAD_REQUEST,
  );
}
