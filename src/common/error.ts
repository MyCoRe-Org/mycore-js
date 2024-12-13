/*
 * This file is part of ***  M y C o R e  ***
 * See https://www.mycore.de/ for details.
 *
 * MyCoRe is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MyCoRe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MyCoRe.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Handles an error by creating a new error message and throwing an error.
 *
 * @param message - A custom error message to prepend to the error
 * @param error - The error object to handle. If the provided `error` is not an instance of `Error`, a generic message ('Unknown error') will be used
 *
 * @throws Always throws an `Error` with a detailed message, including the provided message and the error's message.
 */
const handleError = (message: string, error: unknown): never => {
  throw new Error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
};

export { handleError };
