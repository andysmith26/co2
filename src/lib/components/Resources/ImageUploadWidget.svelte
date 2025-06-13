<!-- src/lib/components/Resources/ImageUploadWidget.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { getUploadWidgetOptions } from '$lib/utils/cloudinary';
	import type { CloudinaryUploadResult } from '$lib/utils/cloudinary';

	// Props
	interface Props {
		disabled?: boolean;
		currentImageUrl?: string | null;
		buttonText?: string;
	}

	let { disabled = false, currentImageUrl = null, buttonText = 'Upload Image' }: Props = $props();

	// State
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let uploadWidget: any = $state(null);

	// Events
	const dispatch = createEventDispatcher<{
		upload: CloudinaryUploadResult;
		error: string;
	}>();

	// Upload widget options
	const widgetOptions = getUploadWidgetOptions();

	onMount(() => {
		// Load Cloudinary upload widget script
		if (typeof window !== 'undefined') {
			if (!window.cloudinary) {
				const script = document.createElement('script');
				script.src = 'https://upload-widget.cloudinary.com/global/all.js';
				script.async = true;
				script.onload = () => {
					// Add a small delay to ensure the widget is fully loaded
					setTimeout(() => initializeWidget(), 100);
				};
				script.onerror = () => {
					error = 'Failed to load Cloudinary upload widget script';
				};
				document.head.appendChild(script);
			} else {
				// Widget already loaded, initialize immediately
				setTimeout(() => initializeWidget(), 50);
			}
		}

		// Cleanup function
		return () => {
			if (uploadWidget) {
				try {
					uploadWidget.destroy();
				} catch (err) {
					console.warn('Error destroying upload widget:', err);
				}
			}
		};
	});

	function initializeWidget() {
		if (!window.cloudinary) {
			error = 'Cloudinary widget not available';
			return;
		}

		try {
			// Create widget with minimal configuration
			uploadWidget = window.cloudinary.createUploadWidget(
				{
					sources: ['local', 'camera', 'url'],
					multiple: false,
					maxFiles: 1,
					resourceType: 'image',
					clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
					maxFileSize: 10000000, // 10MB
					folder: 'co2-resources',
					cropping: true,
					showSkipCropButton: true,
					uploadSignature: generateSignature,
					// Styling to match your app
					styles: {
						palette: {
							window: '#ffffff',
							sourceBg: '#f9fafb',
							windowBorder: '#d1d5db',
							tabIcon: '#4f46e5',
							inactiveTabIcon: '#9ca3af',
							menuIcons: '#4f46e5',
							link: '#4f46e5',
							action: '#4f46e5',
							inProgress: '#4f46e5',
							complete: '#10b981',
							error: '#ef4444',
							textDark: '#111827',
							textLight: '#ffffff',
						},
					},
				},
				handleUploadResult
			);

			error = null; // Clear any previous errors
		} catch (err) {
			console.error('Error initializing upload widget:', err);
			error = 'Failed to initialize upload widget. Please refresh the page and try again.';
		}
	}

	async function generateSignature(callback: Function, paramsToSign: any) {
		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/upload/signature', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ paramsToSign }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to generate signature');
			}

			const signatureData = await response.json();
			callback(signatureData);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to generate upload signature';
			error = errorMessage;
			dispatch('error', errorMessage);
			console.error('Signature generation error:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleUploadResult(uploadError: any, result: any) {
		if (uploadError) {
			const errorMessage = uploadError.message || 'Upload failed';
			error = errorMessage;
			dispatch('error', errorMessage);
			console.error('Upload error:', uploadError);
			return;
		}

		if (result && result.event === 'success' && result.info) {
			const uploadResult: CloudinaryUploadResult = {
				public_id: result.info.public_id,
				secure_url: result.info.secure_url,
				width: result.info.width,
				height: result.info.height,
				format: result.info.format,
				resource_type: result.info.resource_type,
				created_at: result.info.created_at,
				bytes: result.info.bytes,
			};

			error = null; // Clear any errors
			dispatch('upload', uploadResult);
		}
	}

	function openUploadWidget() {
		if (!uploadWidget) {
			error = 'Upload widget not initialized. Please refresh the page and try again.';
			return;
		}

		if (disabled || isLoading) {
			return;
		}

		try {
			error = null;
			uploadWidget.open();
		} catch (err) {
			console.error('Error opening upload widget:', err);
			error = 'Failed to open upload widget. Please try again.';
		}
	}

	// Reactive computed for button state
	const buttonDisabled = $derived(disabled || isLoading || !uploadWidget);
	const buttonTextComputed = $derived(isLoading ? 'Loading...' : buttonText);
</script>

<div class="space-y-4">
	<!-- Current Image Preview -->
	{#if currentImageUrl}
		<div class="mb-4">
			<label class="mb-2 block text-sm font-medium text-gray-700"> Current Image </label>
			<div class="relative inline-block">
				<img
					src={currentImageUrl}
					alt="Current resource"
					class="h-24 w-24 rounded-lg border border-gray-300 object-cover"
				/>
				<div class="absolute -top-2 -right-2">
					<span
						class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
					>
						Current
					</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Upload Button -->
	<div>
		<button
			type="button"
			onclick={openUploadWidget}
			disabled={buttonDisabled}
			class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if isLoading}
				<svg
					class="mr-2 h-4 w-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			{:else}
				<svg
					class="mr-2 h-4 w-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
			{/if}
			{buttonTextComputed}
		</button>

		<p class="mt-2 text-xs text-gray-500">
			{currentImageUrl
				? 'Upload a new image to replace the current one'
				: 'Select an image to upload'}
		</p>
	</div>

	<!-- Error Display -->
	{#if error}
		<div class="mt-3 rounded-md bg-red-100 p-3 text-sm text-red-700">
			<div class="flex">
				<svg
					class="mr-2 h-5 w-5 flex-shrink-0 text-red-400"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>{error}</span>
			</div>
		</div>
	{/if}
</div>
